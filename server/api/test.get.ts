export default defineEventHandler(async (event) => {
    return {
        message: "Hello from Netlify Functions!",
        timestamp: new Date().toISOString(),
        url: getRequestURL(event),
        method: getMethod(event)
    }
})