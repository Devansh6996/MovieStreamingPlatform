import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";
import { getMediaData, saveMediaData, type MediaItem } from "@/lib/media";

async function handleSubmit(formData: FormData) {
  "use server";

  const existing = await getMediaData();
  const title = String(formData.get("title") ?? "");
  const type = String(formData.get("type") ?? "Movie") as MediaItem["type"];
  const genre = String(formData.get("genre") ?? "");
  const description = String(formData.get("description") ?? "");
  const posterUrl = String(formData.get("posterUrl") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "");
  const duration = String(formData.get("duration") ?? "");
  const year = Number(formData.get("year") ?? new Date().getFullYear());
  const rating = String(formData.get("rating") ?? "8.0");

  if (!title || !posterUrl || !videoUrl) {
    redirect("/admin?error=missing-fields");
  }

  const newItem: MediaItem = {
    id: `media-${Date.now()}`,
    title,
    type,
    genre,
    description,
    posterUrl,
    videoUrl,
    duration,
    year,
    rating,
  };

  await saveMediaData([newItem, ...existing]);
  redirect("/admin?success=added");
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!isAdminAuthenticated(session)) {
    redirect("/admin/login");
  }

  const media = await getMediaData();

  return (
    <main className="min-h-screen bg-[#050b16] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-400">Admin panel</p>
            <h1 className="mt-2 text-3xl font-black">StreamFlex content manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10">
              Back to site
            </a>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">
                Logout
              </button>
            </form>
          </div>
        </div>

        {params.success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Content added successfully.
          </div>
        )}

        {params.error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Please fill the required fields before uploading.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form action={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <h2 className="text-xl font-bold">Add new content</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span>Title</span>
                <input name="title" required className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none ring-0 placeholder:text-slate-500 focus:border-red-500" placeholder="Movie or show name" />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Type</span>
                <select name="type" defaultValue="Movie" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500">
                  <option value="Movie">Movie</option>
                  <option value="Series">Series</option>
                  <option value="Live">Live</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Genre</span>
                <input name="genre" required className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" placeholder="Action, Drama, Documentary" />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Year</span>
                <input name="year" type="number" defaultValue={2026} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Description</span>
                <textarea name="description" required rows={4} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" placeholder="Short summary of the title" />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Poster URL</span>
                <input name="posterUrl" required className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" placeholder="https://...jpg" />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Video URL</span>
                <input name="videoUrl" required className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" placeholder="https://...mp4" />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Duration</span>
                <input name="duration" defaultValue="2h 10m" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Rating</span>
                <input name="rating" defaultValue="8.8" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-red-500" />
              </label>
            </div>
            <button type="submit" className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500">
              Publish content
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-5 text-xl font-bold">Content library</h2>
            <div className="space-y-4">
              {media.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <img src={item.posterUrl} alt={item.title} className="h-24 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="truncate text-base font-semibold text-white">{item.title}</h3>
                      <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-red-200">{item.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{item.genre} • {item.year}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
