self.addEventListener('message', async (event) => {
    const { action, url } = event.data;
    if (action === 'load' && url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            self.postMessage({ action: 'loaded', model: arrayBuffer }, [arrayBuffer]);
        } catch (error) {
            self.postMessage({ action: 'error', error: error.message });
        }
    }
});