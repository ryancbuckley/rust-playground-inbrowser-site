// The playground's service worker, for hosts that cannot send headers, such
// as GitHub Pages. Two jobs:
//
// - Cross-origin isolation: it adds COOP and COEP to every response, which
//   SharedArrayBuffer, and so wasm threads, need. index.html registers it and
//   reloads the page once it is in control. web/serve.py sends the headers
//   itself, and then the page leaves it alone.
// - Offline, for the app added to a phone's Home Screen: the page and the
//   toolchain are kept in a cache and served from it first, so the app opens
//   at once and works without a connection. Not the crates: crates.js keeps
//   the ones programs use in a cache of its own ("crates").
//
// scripts/build-pages.sh stamps the two constants below: CACHE with a hash of
// the site's files, so that a deploy changes this file and the browser
// installs the new worker; SHELL with the files to keep. As committed ("dev")
// nothing is cached, so a local build is never stale.
//
// GitHub Pages serves every file, this one too, with max-age=600 and no way
// to change it: the page registers it with updateViaCache "none", so that
// the browser checks for a new worker past its HTTP cache. A worker served
// stale pins the app to the build that installed it.
const CACHE = "playground-0e2d252b21c0";
const SHELL = ["./", "browser-kernel/LICENSE", "browser-kernel/fs.js", "browser-kernel/kernel.js", "browser-kernel/thread-worker.js", "dist/licenses.html", "dist/rustc.wasm.gz", "dist/sysroot.bundle", "dist/toolchain.json", "dist/ui/00dad25a2b83ccae.js", "dist/ui/01096e9c9c735fc1.woff2", "dist/ui/02125cf33458c701.js", "dist/ui/034b40eb67a6ff5c.js", "dist/ui/051dc4c854e8d2bb.js", "dist/ui/07eb8960221d2286.js", "dist/ui/0b192d5662b71611.js", "dist/ui/0c16e946df904af9.js", "dist/ui/0c5c7883d8148668.js", "dist/ui/0c65b5b4e413f447.js", "dist/ui/0c9dff2a9d263585.woff2", "dist/ui/0cd45fe1ed92d348.js", "dist/ui/0d8befad378f3df8.js", "dist/ui/0f7a0afe97f44bf0.js", "dist/ui/108049afa357e896.js", "dist/ui/112f9e6b01f4bef9.js", "dist/ui/1158bb3bd5126fca.js", "dist/ui/1238a915530f3b68.js", "dist/ui/13b967d4ab87d9fb.js", "dist/ui/15455cd3fa335e04.js", "dist/ui/157d5a507eb52468.js", "dist/ui/168e817af1223f45.woff2", "dist/ui/1978ceeb53b4ec8f.js", "dist/ui/1a0a2d8b333ff53c.js", "dist/ui/1ae113a292df7601.js", "dist/ui/1dfa89f00a2e174f.js", "dist/ui/1e4affd687c9a613.js", "dist/ui/1ed86d59d92efccc.js", "dist/ui/1fa2f6fb64d0840b.woff2", "dist/ui/206b0117c909526e.woff2", "dist/ui/22cb6a7b641b296a.js", "dist/ui/24788185d3fe1ea2.woff2", "dist/ui/255543b776b59594.js", "dist/ui/258f77ab1ec4c31b.js", "dist/ui/277412b2341251e8.js", "dist/ui/2b18e0f4566ea345.js", "dist/ui/2b51d202877952b9.js", "dist/ui/2f690b0a63ce90c7.js", "dist/ui/30c53eede8a0869c.js", "dist/ui/3134f256383cf417.js", "dist/ui/32fad4a46f789fc1.js", "dist/ui/33ec88bbc8a64872.js", "dist/ui/340af49f937a2f5d.js", "dist/ui/346de399bcbc8019.js", "dist/ui/355ab582c13c8846.js", "dist/ui/3aa329da6b96d903.js", "dist/ui/3ccb145a5194f8aa.js", "dist/ui/3debf4a81d3b8058.js", "dist/ui/3e2dee01e3bf674b.css", "dist/ui/3e66d534a657c812.js", "dist/ui/3f5dae34dd969375.js", "dist/ui/3f60bbc032382a45.js", "dist/ui/40b963360c9c120c.woff2", "dist/ui/43d02306fe29faf2.js", "dist/ui/445e747026b535e4.js", "dist/ui/4469d848519604a2.js", "dist/ui/4596ee08db428f22.js", "dist/ui/4a2fa037bce9595d.js", "dist/ui/4c6851dbbbcef1f9.woff2", "dist/ui/4ff0850523733d06.js", "dist/ui/5024cc87f2a80ed0.js", "dist/ui/50fe4dd525d537f2.js", "dist/ui/55512969a044a290.js", "dist/ui/5738923d854bb649.woff2", "dist/ui/57ea158991c04975.woff2", "dist/ui/58045ff4f2263fd9.js", "dist/ui/5871f5c12aecdb89.js", "dist/ui/58a822ce303b7fef.css", "dist/ui/59239c797f2ffa1e.woff2", "dist/ui/5a72a617d55c8553.js", "dist/ui/5ba9bc6c442dc3a6.js", "dist/ui/5be259e25c65a57f.js", "dist/ui/5dfd444e2d446218.js", "dist/ui/5ebceb92849b3db6.js", "dist/ui/60b3863fa85f0db2.css", "dist/ui/6140e8b9d5647209.woff2", "dist/ui/617eb4eef3f0d143.js", "dist/ui/656eece1157fb0bd.js", "dist/ui/659702d9e49225b3.js", "dist/ui/6618be209a47dd62.js", "dist/ui/66c32b475106255d.js", "dist/ui/66d15a6f220f07a5.js", "dist/ui/66de3c816a6dc864.js", "dist/ui/66f191acd8a8cd21.js", "dist/ui/6730c585804e3fb3.js", "dist/ui/67af05d3d2081f53.wasm", "dist/ui/67f77af4b7a1b077.js", "dist/ui/6ba5eaf85fae4ae9.js", "dist/ui/6f0f19b5ef6fc04a.js", "dist/ui/6f558c5549c0e5c9.woff2", "dist/ui/703c22663806866b.js", "dist/ui/75385403510fa2b0.js", "dist/ui/769b65f9dd4ca5ad.js", "dist/ui/76f5cf47c155053c.woff2", "dist/ui/77872ff0293f299b.js", "dist/ui/78b487313b174ec1.js", "dist/ui/7b034a35d791f13a.js", "dist/ui/7c62ebf8a3c4a4de.js", "dist/ui/7ce5fbac08e1f052.js", "dist/ui/7de42332d591ee99.js", "dist/ui/7eae81fe2535e1e4.js", "dist/ui/84a65b4e177a8c3c.js", "dist/ui/8561d099e7e2bb17.js", "dist/ui/86cb9d05769ecd96.js", "dist/ui/8840c1a764794a2d.js", "dist/ui/88c56a0ab55e5a42.js", "dist/ui/897d60677e577651.js", "dist/ui/8c880d54680adf11.js", "dist/ui/8cd5c9006690b0b5.js", "dist/ui/8e6910e1971cc02c.js", "dist/ui/8e76fe49b9ce3b89.js", "dist/ui/8fabd21593b4f025.js", "dist/ui/9164215cdce15061.css", "dist/ui/9164215cdce15061.js", "dist/ui/944d05b6319cfbab.woff2", "dist/ui/9632e2e619c77db0.js", "dist/ui/972ffa6624c6a4d8.js", "dist/ui/97658015c4b0c8d7.js", "dist/ui/985734a6de25adb8.js", "dist/ui/98b6112bc851b3a4.js", "dist/ui/99c6b07b913bfda8.woff2", "dist/ui/9bb83c3861e4cf50.js", "dist/ui/9c50b1197822383b.js", "dist/ui/9ccb749e327c6e8b.js", "dist/ui/9eb947e5748417a7.woff2", "dist/ui/9f588dccfe692322.js", "dist/ui/a51d30c12a77a6ff.js", "dist/ui/a70e401e5c93f556.woff2", "dist/ui/a79e2090973054e5.js", "dist/ui/a82bc58d99fa9c52.js", "dist/ui/a96cc7e33dffc45c.js", "dist/ui/a9c25c707bd8f043.js", "dist/ui/ab8284a7b499a4e1.js", "dist/ui/adf298f34a19d402.js", "dist/ui/b1c7f740389117ef.wasm", "dist/ui/b27772d503ca85e2.js", "dist/ui/b2e89adb6f9a4cfa.js", "dist/ui/b5dc2ce6994624cb.js", "dist/ui/b73f367da8b22223.woff2", "dist/ui/b7de700e2ec71efb.js", "dist/ui/b8779a9c81cf68ac.js", "dist/ui/bb94ff65527bdaef.js", "dist/ui/bbe4c7675a6ced83.woff2", "dist/ui/bc0b122cd25a842b.js", "dist/ui/bc6402ec1a84a29c.js", "dist/ui/bcabeea78a8d33be0a64383f4e69b76b.worker.js", "dist/ui/bf10871cdfe15b77.js", "dist/ui/c0c93b3891980d15.js", "dist/ui/c157c7daec067060.js", "dist/ui/c2cacb7e7f291901.woff2", "dist/ui/c3805319d0808359.js", "dist/ui/c3a3d1783fbd2750.js", "dist/ui/c474d63eda8ca0ea.js", "dist/ui/c4f28b8d0e746bf7.js", "dist/ui/c5c88287444249a9.woff2", "dist/ui/cbc05d3874c5fbf6.js", "dist/ui/cbfe8c3c47fef2f3.js", "dist/ui/cc5c3b59c78bf404.js", "dist/ui/d266ec96a4f64640.woff2", "dist/ui/d4a6a211d428bd5a.js", "dist/ui/d4b9e536f414ded0.js", "dist/ui/d6318bdc67d6df26.js", "dist/ui/d68adc2899e05bca.js", "dist/ui/da7bd7f956d5924b.js", "dist/ui/dc5d7ff7be922946.js", "dist/ui/dc8c6390e576c273.js", "dist/ui/de570c740b3ca0f4.woff2", "dist/ui/e0e301f57cb37c59.js", "dist/ui/e1d64f95355c2616.woff2", "dist/ui/e20fd978c0f4acc1.woff2", "dist/ui/e2a598aa7421bf48.js", "dist/ui/e9393d154506b84d.js", "dist/ui/eacc472a280ce490.js", "dist/ui/eb6f53d1010de93b.js", "dist/ui/ec1694e9cbae1c84.js", "dist/ui/efb1ffebb8fec5a1.js", "dist/ui/f1a8bc48c927ea99.js", "dist/ui/f2649753844a9cab.js", "dist/ui/f31aa963c8d21e51.js", "dist/ui/f31e9ee1b6d06a5d.woff2", "dist/ui/f39454038d4c8920.js", "dist/ui/f5ac0ce6ea26b631.js", "dist/ui/f64b702191dcc43c.js", "dist/ui/f6f73197ef363d27.js", "dist/ui/f8439ecbc88a176b.js", "dist/ui/f84dbb6589bf2bb1.js", "dist/ui/fad1dcaebd42eef1.js", "dist/ui/fb108e448fe84c3c.js", "dist/wild.wasm.gz", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "kernel/crates.js", "kernel/kernel-worker.js", "manifest.webmanifest"];

const caching = CACHE !== "dev";

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    if (!self.registration.active) {
      // The first install: the page is waiting for this worker to reload
      // isolated, and is fetching the same files itself, which fill the cache
      // as they pass; it asks for the rest once its toolchain has loaded
      // ("precache"). So: take over at once, with nothing to fetch first.
      await self.skipWaiting();
      return;
    }
    // A new build, beside one in control: fill its cache, all or nothing
    // (addAll fails on any error, and the old worker stays), and then wait.
    // Taking over a running tab would put the new build under a page of the
    // old one; the page offers a reload instead and sends SKIP_WAITING.
    if (caching) await (await caches.open(CACHE)).addAll(SHELL);
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // Files from another build are dead weight. "crates" is crates.js's.
    for (const name of await caches.keys()) {
      if (name.startsWith("playground-") && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
  else if (e.data?.type === "precache") e.waitUntil(precache());
});

/** Fetch whatever of SHELL the first visit did not. */
async function precache() {
  if (!caching) return;
  const cache = await caches.open(CACHE);
  for (const url of SHELL) {
    if (!(await cache.match(url, { ignoreVary: true }))) await cache.add(url).catch(() => {});
  }
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // A request only the browser's cache may answer, which fetch() would refuse.
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;
  e.respondWith(respond(request, (p) => e.waitUntil(p)).then(isolated));
});

/** Cache first, for the page and the toolchain; the network for the rest. */
async function respond(request, waitUntil) {
  const url = new URL(request.url);
  if (!caching || request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/dist/crates/")) {
    return fetch(request);
  }
  // The page, under one key whatever its query: a share link's ?code= is
  // read by the page, and would otherwise be a copy of it per link.
  const scope = new URL(self.registration.scope);
  const page = url.pathname === scope.pathname || url.pathname === `${scope.pathname}index.html`;
  const key = page ? scope.href : request;
  const cache = await caches.open(CACHE);
  // ignoreVary is load-bearing: GitHub Pages compresses, so responses carry
  // Vary: Accept-Encoding, and cache.match otherwise compares it against the
  // stored request's. A page's request and the worker's own fetch need not
  // agree, and the miss would fall through to a network that is not there:
  // offline only, which is where it is hardest to notice.
  const hit = await cache.match(key, { ignoreVary: true });
  if (hit) return hit;
  // Not cached yet (the first visit, or a file the first visit did not use):
  // fetched, and kept. The page, the toolchain and the hashed interface files
  // in this cache are all of one build, named by CACHE, so a hit is never a
  // mix of two.
  try {
    const response = await fetch(request);
    // Not errors (a cached 404 would outlive the mistake), and not opaque
    // ones. Stored alongside, not before answering: the page reads the
    // toolchain as it streams in.
    if (response.ok && response.type === "basic") waitUntil(cache.put(key, response.clone()));
    return response;
  } catch {
    // A 503 keeps this a failed request the page can handle; a rejected
    // respondWith surfaces as an unhandled service worker error instead.
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

function isolated(response) {
  // Opaque (cross-origin, no-cors): its headers cannot be changed.
  if (response.status === 0) return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
