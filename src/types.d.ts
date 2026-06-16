declare global {
    namespace Express{
        interface Request{
            user?:object
        }
        interface Response{
            user?:object
        }
    }
}
export {}