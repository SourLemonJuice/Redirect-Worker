class RedirectUnit {
    constructor(router, destination, status, path_retention) {
        this.router = router;
        this.destination = destination;
        this.status = status;
        this.path_retention = path_retention;
    };
};

const redirect_list = [
    new RedirectUnit("/demo", "https://example.com", 302, true),
    new RedirectUnit("/github/", "https://example.com", 302, true), // TODO format those url, then it should be works
];

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const { pathname, search } = url;

        let matched_unit;
        for (let unit of redirect_list) {
            if (pathname.startsWith(unit.router) == true) {
                matched_unit = unit;
                break;
            }
        }
        if (matched_unit == undefined)
            return new Response("No Router", { status: 404 });

        let destination_url = `${matched_unit.destination}`
        if (matched_unit.path_retention == true)
            destination_url += pathname.substring(matched_unit.router.length) + search;

        console.log("Redirect to" + destination_url);
        return Response.redirect(destination_url, matched_unit.status);
    },
};
