
interface AppElements {
  video: HTMLVideoElement;
  reel: HTMLDivElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  preview: HTMLImageElement;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

async function handleDrop(e: DragEvent, { video }: AppElements) {
  e.preventDefault()
  const files = e.dataTransfer?.files;
  if(!files?.length) {
    console.info('No files dropped');
    return;
  }
  const file = files[0];

  // check if its a video file
  if(!file.type.startsWith('video/')) {
    console.info('Not a video file');
    return;
  }
  // play it!
  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
}


function wait(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function screenshot({ ctx, video, reel, canvas }: AppElements): Promise<HTMLImageElement> {
  ctx.drawImage(video, 0, 0);
  const img = document.createElement('img');
  img.src = canvas.toDataURL();
  return img;
}

async function scrubVideo({ video }: AppElements) {
  // chop the video into 10 increments
  const INCREMENT_SECONDS = 4;
  const INCREMENTS = Math.floor(video.duration / INCREMENT_SECONDS);
  const frames = Array(INCREMENTS)
    .fill(undefined)
    .map((_, i) => i * INCREMENT_SECONDS);
  for (const frame of frames) {
    console.log(frame)
    video.currentTime = frame;
    await wait(100);
  }
}


async function startApp() {
  const video = document.querySelector<HTMLVideoElement>('video');
  const reel = document.querySelector<HTMLDivElement>('.reel');
  const canvas = document.querySelector<HTMLCanvasElement>('canvas');
  const preview = document.querySelector<HTMLImageElement>('.preview');
  const ctx = canvas?.getContext('2d');
  if(!video || !reel || !canvas || !ctx || !preview) {
    console.error('Could not find video or reel');
    return;
  }

  const elements: AppElements = {video, reel, canvas, ctx, preview };

  document.body.addEventListener('dragover', handleDragOver);
  document.body.addEventListener('drop', (e) => handleDrop(e, elements));

  video.addEventListener('loadedmetadata', () => {
    console.log('loadedmetadata');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });

  video.addEventListener('seeked', async () => {
    console.log('Seeked');
    // start taking screenshots
    const img = await screenshot(elements);
    // wrap it in a link
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'screenshot.png';
    a.appendChild(img);
    reel.appendChild(a);
  });

  video.addEventListener('loadeddata', async () => {
    console.log('loadeddata');
    scrubVideo(elements);
  });

  reel.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if(target instanceof HTMLImageElement) {
      preview.src = target.src;
    }
  });
}


startApp();
