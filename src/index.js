class RedirectUnit {
    constructor(destination, status, path_forwarding) {
        // e.g. https://example.com
        this.destination = destination
        // 302, 301, 307 or 308
        this.status = status
        // retention the extra path: /demo/other_load?xxx -> /destination/other_load?xxx
        this.path_forwarding = path_forwarding
    }
}

const redirect_tree = {
    '/demo': new RedirectUnit('https://example.com', 302, false),
    '/github': new RedirectUnit('https://github.com', 302, true),
    '/sub': {
        '/google': new RedirectUnit('https://about.google', 302, false),
    },
}

function noRouterError(url) {
    console.error('Invalid router path: ' + url.pathname)
    return new Response('No Router', { status: 404 })
}

/*
    Return the key(not value) of the matched node
*/
function scanRedirectTreeLayer(node, path) {
    for (const router in node) {
        if (path.startsWith(router)) {
            return router
        }
    }

    return null
}

export default {
    async fetch(request) {
        const url = new URL(request.url)
        const { pathname, search } = url

        // parse the config tree
        let node = redirect_tree
        let remaining_path = pathname
        while (true) {
            let node_key = scanRedirectTreeLayer(node, remaining_path)
            if (node_key == null) {
                return noRouterError(url)
            }
            remaining_path = remaining_path.slice(node_key.length)

            node = node[node_key]
            if (node instanceof RedirectUnit) break
        }

        // prepare redirect URL
        let destination_url = node.destination
        if (node.path_forwarding == true) {
            destination_url += `${remaining_path}${search}`
        }

        console.log(`Redirect ${pathname} -> ${destination_url}`)
        return Response.redirect(destination_url, node.status)
    },
}
