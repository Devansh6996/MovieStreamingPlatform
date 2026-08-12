import { getMediaData } from "@/lib/media";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const media = await getMediaData();
  const featured = media.find((item) => item.featured) ?? media[0];

  if (!featured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050b16] px-6 text-white">
        <p>No titles are available yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050b16] text-white">
      <section className="relative isolate min-h-[620px] overflow-hidden">
        <img
          src={featured.posterUrl}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050b16_5%,rgba(5,11,22,.86)_35%,rgba(5,11,22,.25)_72%,#050b16_100%),linear-gradient(0deg,#050b16_1%,transparent_55%)]" />

        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10">
          <a href="/" className="text-2xl font-black tracking-tight">
            STREAM<span className="text-red-500">FLEX</span>
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-200">
            <a href="#library" className="hidden transition hover:text-white sm:block">Browse</a>
            <a href="/admin" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 transition hover:bg-white/20">Admin</a>
          </nav>
        </header>

        <div className="mx-auto flex max-w-7xl items-end px-6 pb-20 pt-28 md:px-10 md:pt-36">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-red-400">StreamFlex Original</p>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">{featured.title}</h1>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-200">
              <span className="rounded border border-white/35 px-1.5 py-0.5 text-xs">{featured.type}</span>
              <span>{featured.year}</span>
              <span className="text-amber-300">★ {featured.rating}</span>
              <span>{featured.duration}</span>
              <span>{featured.genre}</span>
            </div>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 md:text-lg">{featured.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={featured.videoUrl} target="_blank" rel="noreferrer" className="rounded-full bg-red-600 px-6 py-3 font-bold shadow-lg shadow-red-950/50 transition hover:bg-red-500">▶ Play now</a>
              <a href="#library" className="rounded-full border border-white/25 bg-black/20 px-6 py-3 font-bold transition hover:bg-white/10">Explore titles</a>
            </div>
          </div>
        </div>
      </section>

      <section id="library" className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-400">Watch next</p>
            <h2 className="mt-2 text-3xl font-black">Popular on StreamFlex</h2>
          </div>
          <span className="text-sm text-slate-400">{media.length} titles</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.07]">
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
                <img src={item.posterUrl} alt={`${item.title} poster`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050b16] via-[#050b16]/30 to-transparent p-4 pt-14">
                  <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">{item.type}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <span className="shrink-0 text-sm text-amber-300">★ {item.rating}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.year} · {item.genre}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-300">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
