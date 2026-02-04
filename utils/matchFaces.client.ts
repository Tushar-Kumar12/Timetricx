// utils/matchFaces.client.ts
import * as faceapi from "face-api.js";
import { loadFaceModels } from "./loadFaceModels.client";

export const matchFacesClient = async (
  liveEl: HTMLImageElement | HTMLVideoElement,
  storedEl: HTMLImageElement
) => {
  await loadFaceModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,        // 🔥 fast
    scoreThreshold: 0.4,   // balance speed + accuracy
  });

  const face1 = await faceapi
    .detectSingleFace(liveEl, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  const face2 = await faceapi
    .detectSingleFace(storedEl, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!face1 || !face2) {
    return {
      success: false,
      message: "Face not detected",
    };
  }

  const distance = faceapi.euclideanDistance(
    face1.descriptor,
    face2.descriptor
  );

  return {
    success: true,
    distance,
    match: distance < 0.45, // threshold
  };
};
