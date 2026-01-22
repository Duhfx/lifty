interface QueuedRequest {
  id: string;
  timestamp: number;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body: any;
  retryCount: number;
}

class OfflineQueue {
  private storageKey = 'lifty-offline-queue';
  private maxRetries = 3;

  private getQueue(): QueuedRequest[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveQueue(queue: QueuedRequest[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
  }

  add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): void {
    const queue = this.getQueue();
    const newRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(newRequest);
    this.saveQueue(queue);
    console.log(`Request queued: ${request.endpoint}`);
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Still offline, skipping queue processing');
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} queued requests`);

    const results = await Promise.allSettled(
      queue.map(async (request) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(request.endpoint, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(request.body),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return { success: true, id: request.id };
        } catch (error) {
          console.error(`Failed to process ${request.endpoint}:`, error);

          if (request.retryCount < this.maxRetries) {
            return { success: false, id: request.id, retry: true };
          }

          return { success: false, id: request.id, retry: false };
        }
      })
    );

    // Atualizar fila
    const updatedQueue = queue.filter((request, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          return false; // Remover da fila
        }
        if (result.value.retry) {
          request.retryCount++;
          return true; // Manter na fila
        }
      }
      return false; // Remover se falhou definitivamente
    });

    this.saveQueue(updatedQueue);
    console.log(`Queue processed. Remaining: ${updatedQueue.length}`);
  }

  getQueueSize(): number {
    return this.getQueue().length;
  }

  clearQueue(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const offlineQueue = new OfflineQueue();
