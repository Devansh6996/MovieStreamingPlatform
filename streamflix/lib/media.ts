import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { promises as fs } from "node:fs";
import path from "node:path";

export type MediaItem = {
  id: string;
  title: string;
  type: "Movie" | "Series" | "Live";
  genre: string;
  description: string;
  posterUrl: string;
  videoUrl: string;
  duration: string;
  year: number;
  rating: string;
  featured?: boolean;
};

const defaultMedia: MediaItem[] = [
  {
    id: "hero-1",
    title: "Midnight Drift",
    type: "Movie",
    genre: "Sci‑Fi",
    description: "A rogue pilot uncovers a hidden signal that changes the future of the city.",
    posterUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "2h 09m",
    year: 2026,
    rating: "9.1",
    featured: true,
  },
  {
    id: "hero-2",
    title: "Neon Tide",
    type: "Series",
    genre: "Drama",
    description: "A coastal family navigates love, loyalty, and danger in a city under pressure.",
    posterUrl:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "8 Episodes",
    year: 2025,
    rating: "8.8",
    featured: true,
  },
  {
    id: "hero-3",
    title: "Velvet Code",
    type: "Movie",
    genre: "Action",
    description: "A brilliant cyber detective enters the city's underground network to stop a blackout.",
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "1h 48m",
    year: 2024,
    rating: "8.7",
  },
  {
    id: "hero-4",
    title: "Glass Horizon",
    type: "Series",
    genre: "Thriller",
    description: "In a city of mirrored towers, every secret is broadcast to the world.",
    posterUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "6 Episodes",
    year: 2026,
    rating: "9.0",
  },
];

const mediaFilePath = path.join(process.cwd(), "data", "media.json");
const mediaBlobName = "catalog/media.json";

function getAzureMediaContainer() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!accountName || !containerName) {
    return null;
  }

  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const serviceUrl = `https://${accountName}.blob.core.windows.net`;
  const credential = accountKey
    ? new StorageSharedKeyCredential(accountName, accountKey)
    : new DefaultAzureCredential();

  return new BlobServiceClient(serviceUrl, credential).getContainerClient(containerName);
}

async function readLocalMedia() {
  const raw = await fs.readFile(mediaFilePath, "utf8");
  const parsed = JSON.parse(raw) as MediaItem[];
  return parsed.length ? parsed : defaultMedia;
}

async function writeLocalMedia(items: MediaItem[]) {
  await fs.mkdir(path.dirname(mediaFilePath), { recursive: true });
  await fs.writeFile(mediaFilePath, JSON.stringify(items, null, 2), "utf8");
}

export async function getMediaData(): Promise<MediaItem[]> {
  const container = getAzureMediaContainer();

  if (container) {
    try {
      const blob = container.getBlockBlobClient(mediaBlobName);
      const download = await blob.downloadToBuffer();
      const parsed = JSON.parse(download.toString("utf8")) as MediaItem[];
      return parsed.length ? parsed : defaultMedia;
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode !== 404) {
        throw error;
      }

      await container.createIfNotExists();
      const blob = container.getBlockBlobClient(mediaBlobName);

      try {
        await blob.upload(JSON.stringify(defaultMedia, null, 2), Buffer.byteLength(JSON.stringify(defaultMedia, null, 2)), {
          conditions: { ifNoneMatch: "*" },
          blobHTTPHeaders: { blobContentType: "application/json" },
        });
        return defaultMedia;
      } catch (seedError: unknown) {
        if ((seedError as { statusCode?: number }).statusCode !== 412) {
          throw seedError;
        }

        const seeded = await blob.downloadToBuffer();
        const parsed = JSON.parse(seeded.toString("utf8")) as MediaItem[];
        return parsed.length ? parsed : defaultMedia;
      }
    }
  }

  try {
    return await readLocalMedia();
  } catch {
    await writeLocalMedia(defaultMedia);
    return defaultMedia;
  }
}

export async function saveMediaData(items: MediaItem[]) {
  const container = getAzureMediaContainer();

  if (container) {
    await container.createIfNotExists();
    await container.getBlockBlobClient(mediaBlobName).uploadData(Buffer.from(JSON.stringify(items, null, 2)), {
      blobHTTPHeaders: { blobContentType: "application/json" },
    });
    return;
  }

  await writeLocalMedia(items);
}
