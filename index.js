import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import cron from 'node-cron';
import PImage from 'pureimage';
//We need to import the module firium
import { Gif } from 'make-a-gif';
import { PNG } from 'pngjs';
import needle from 'needle';
import { getMMAData } from './scrape.js';
import fs from 'fs';

let height = 32;
let width = 64;

PImage.encodePNGSync = function (bitmap) {
  let png = new PNG({
    width: bitmap.width,
    height: bitmap.height,
  });

  for (let i = 0; i < bitmap.width; i++) {
    for (let j = 0; j < bitmap.height; j++) {
      for (let k = 0; k < 4; k++) {
        let n = (j * bitmap.width + i) * 4 + k;
        png.data[n] = bitmap.data[n];
      }
    }
  }

  return PNG.sync.write(png);
};

cron.schedule('* * * * *', () => {
  // Push an updated image to your tidbyt device
  console.log('running a task every minute');
});

async function generateStaticImage() {
  PImage.registerFont('./fonts/OpenSans-Regular.ttf', 'Open Sans').loadSync();
  const image = PImage.make(width, height);
  const ctx = image.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = "24px 'Open Sans'";
  ctx.fillText('ABC', 1, 16);

  return { image, ctx };
}

function sendToTidbyt(image) {
  let basewidthString = image.toString('basewidth');
  needle(
    'post',
    `https://api.tidbyt.com/v0/devices/${process.env.TIDBYT_DEVICE_ID}/push`,
    {
      image: basewidthString,
      installationID: process.env.TIDBYT_INSTALLATION_ID,
      // Most of the time we want our app to stay in regular rotation and update only in the background.
      background: true,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TIDBYT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then((res) => {
      //   console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function runTidbytApp() {
  let MMAData = getMMAData();

  let { image } = await generateStaticImage();

  // Write your image to a file for debugging purposes
  PImage.encodePNGToStream(image, fs.createWriteStream('out.png'))
    .then(() => {
      console.log('wrote out the png file to out.png');
    })
    .catch((e) => {
      console.log('there was an error writing');
    });

  let pngImage = await PImage.encodePNGSync(image);

  // sendToTidbyt(pngImage);
}

let makeAGif = async (frames) => {
  //We instance the class Gif and give the proportions of width 500 and height 500
  const myGif = new Gif(height, width);
  //We set 3 images that will be 3 frames
  await myGif.setFrames(frames);

  //Writes the gif in this folder
  // await fs.writeFile(join(__dirname, 'make-a-gif.gif'), Render);

  //Render the image, it will return a Buffer or it will give an error if anything goes wrong
  return await myGif.decode();
};

let animator = async () => {
  let totalFrames = 10;
  let staticCanvas = generateStaticCanvasAssets();

  let frames = [];

  for (let i = 0; i < totalFrames; i++) {
    let frame = await generateFrame(staticCanvas, i, totalFrames);
    frames.push(frame);
  }
};

let generateStaticCanvasAssets = () => {
  let { image, ctx } = generateStaticImage();
  return ctx;
};

let generateFrame = (ctx, frameNumber, totalFrames) => {
  let frameOffset = frameNumber / totalFrames;
  console.log(ctx);

  return;
};
// This could be moved into the cron job if you want to run it every minute
runTidbytApp();
