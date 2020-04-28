import axios from 'axios'

type load<T> = (url: string, loadDelegate: load<T>) => Promise<T>

interface ConfigLoader {
    handles(url: string): boolean
    load<T>(url: string, load: load<T>):Promise<T>
}

class HttpConfigLoader implements ConfigLoader {
    handles(url: string): boolean {
        try {
            const parsed = new URL(url)
            return ['http:','https:'].includes(parsed.protocol)
        } catch {
            return false
        }
    }
    async load<T>(url: string, loadDelegate: load<T>): Promise<T> {
        return (await axios.get(url)).data
    }

}

const loaders: ConfigLoader[] = [new HttpConfigLoader()]

export async function config<T>(url: string): Promise<T> {
    return load(url,load)
}

async function load<T>(url: string, loadDelegate: load<T>): Promise<T> {
    for (const loader of loaders) {
        if (loader.handles(url)) {
            return loader.load(url,loadDelegate)
        }
    }
}

