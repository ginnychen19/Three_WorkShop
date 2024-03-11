self.addEventListener('message', async (event) => {
    // 取得 從主線程傳來的參數
    const { action, url } = event.data;
    if (action === 'load' && url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            /* 這裡的arrayBuffer取的東西是什麼??? */
            self.postMessage({ action: 'loaded', model: arrayBuffer }, [arrayBuffer]);
        } catch (error) {
            self.postMessage({ action: 'error', error: error.message });
        }
    }
});

/* fetch方法 - 異步的取得資源 */
/*
    arrayBuffer 是通过 fetch 请求从指定 URL 下载的资源的二进制表示。
    arrayBuffer 包含了這個模型文件的全部数据。
    通过 fetch 获取的响应体可以通过调用 .arrayBuffer() 方法转换成一个 ArrayBuffer 对象
    该对象是一个通用的、固定长度的二进制数据缓冲区，表示下载的文件数据。

    然后，这个 ArrayBuffer 可以通过 postMessage 发送回主线程
    由于 ArrayBuffer 是传输的，这个过程不会复制数据
    而是转移所有权（当你在 postMessage 的第二个参数中指定它时）。
    这意味着一旦数据被发送，worker 线程中的 arrayBuffer 将不再可用
    因为它的所有权已经转移给了主线程。
    这种方式非常高效，因为它避免了大量数据的复制。
*/