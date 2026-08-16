import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { analyzeSkinImage, GeminiError } from "../lib/gemini";
import { db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const STEPS = {
  CHOOSE: "choose",
  CAMERA: "camera",
  PREVIEW: "preview",
  LOADING: "loading",
  RESULT: "result",
  ERROR: "error",
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, dataUrl, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SkinAnalysis({ open, onOpen, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [image, setImage] = useState(null); // { base64, dataUrl, mimeType }
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function resetFlow() {
    stopCamera();
    setStep(STEPS.CHOOSE);
    setImage(null);
    setResult(null);
    setErrorMsg("");
    setSaveState("idle");
  }

  function handleClose() {
    resetFlow();
    onClose();
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setStep(STEPS.CAMERA);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setErrorMsg("Couldn't access your camera. Please check permissions, or upload a photo instead.");
      setStep(STEPS.ERROR);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    setImage({ base64: dataUrl.split(",")[1], dataUrl, mimeType: "image/jpeg" });
    setStep(STEPS.PREVIEW);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      setStep(STEPS.ERROR);
      return;
    }
    const parsed = await fileToBase64(file);
    setImage(parsed);
    setStep(STEPS.PREVIEW);
  }

  async function runAnalysis() {
    if (!image) return;
    setStep(STEPS.LOADING);
    try {
      const data = await analyzeSkinImage(image.base64, image.mimeType);
      setResult(data);
      setStep(STEPS.RESULT);
    } catch (err) {
      setErrorMsg(err instanceof GeminiError ? err.message : "Something went wrong analysing your photo.");
      setStep(STEPS.ERROR);
    }
  }

  async function saveResult() {
    if (!user || !result) return;
    setSaveState("saving");
    try {
      await addDoc(collection(db, "users", user.uid, "skinAnalyses"), {
        ...result,
        createdAt: serverTimestamp(),
      });
      setSaveState("saved");
    } catch {
      setSaveState("idle");
      setErrorMsg("Couldn't save this result right now, but you can still read it below.");
    }
  }

  useEffect(() => stopCamera, []); // cleanup camera stream on unmount

  useEffect(() => {
    if (!open) {
      const id = setTimeout(resetFlow, 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* ── Promo section ───────────────────────────────── */}
      <section className="skin-analysis" id="skin-analysis">
        <div className="section-header">
          <span className="eyebrow">Free & Instant</span>
          <h2>
            AI-Powered <em>Skin Analysis</em>
          </h2>
          <p>Upload a photo or use your camera — Sage reads your skin in seconds and flags what matters.</p>
        </div>

        <div className="sa-promo">
          <div className="sa-steps">
            <div className="sa-step">
              <div className="sa-step-num">01</div>
              <h4>Capture</h4>
              <p>Snap a clear, well-lit photo of the area you're concerned about, or upload one.</p>
            </div>
            <div className="sa-step">
              <div className="sa-step-num">02</div>
              <h4>Analyse</h4>
              <p>Our AI reviews texture, tone, and visible concerns against dermatology-informed patterns.</p>
            </div>
            <div className="sa-step">
              <div className="sa-step-num">03</div>
              <h4>Act</h4>
              <p>Get a plain-English summary with severity, urgency, and next-step recommendations.</p>
            </div>
          </div>

          <div className="sa-cta-panel">
            <div className="sa-cta-icon">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <h3>Ready when you are</h3>
            <p>Takes about 30 seconds. Your photo is analysed on the spot and never stored unless you choose to save your results.</p>
            <button className="btn-solid full" onClick={onOpen}>
              Start My Analysis
            </button>
          </div>
        </div>
      </section>

      {/* ── Modal flow ──────────────────────────────────── */}
      {open && (
        <div className="sa-overlay" onClick={handleClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <span className="sa-modal-title">
                <i className="fa-solid fa-microscope"></i> Skin Analysis
              </span>
              <button className="sa-modal-close" onClick={handleClose} aria-label="Close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="sa-modal-body">
              {step === STEPS.CHOOSE && (
                <div className="sa-choice-grid">
                  <button className="sa-choice-tile" onClick={startCamera}>
                    <i className="fa-solid fa-camera"></i>
                    <span className="sa-choice-title">Use Camera</span>
                    <span className="sa-choice-sub">Take a photo now</span>
                  </button>
                  <button className="sa-choice-tile" onClick={() => fileInputRef.current?.click()}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span className="sa-choice-title">Upload Photo</span>
                    <span className="sa-choice-sub">From your device</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {step === STEPS.CAMERA && (
                <div>
                  <button className="sa-back" onClick={() => { stopCamera(); setStep(STEPS.CHOOSE); }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                  </button>
                  <div className="sa-cam-box">
                    <video ref={videoRef} autoPlay playsInline muted />
                    <div className="sa-cam-scanline"></div>
                  </div>
                  <button className="btn-solid full" onClick={capturePhoto}>
                    <i className="fa-solid fa-camera"></i> Capture Photo
                  </button>
                </div>
              )}

              {step === STEPS.PREVIEW && image && (
                <div>
                  <button className="sa-back" onClick={resetFlow}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                  </button>
                  <img className="sa-preview-img" src={image.dataUrl} alt="Selected for analysis" />
                  <button className="btn-solid full" onClick={runAnalysis}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Analyse This Photo
                  </button>
                </div>
              )}

              {step === STEPS.LOADING && (
                <div className="sa-loading">
                  <div className="sa-spinner"></div>
                  <p>Sage is reading your skin…</p>
                </div>
              )}

              {step === STEPS.ERROR && (
                <div>
                  <div className="sa-error">
                    <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
                  </div>
                  <button className="btn-solid full" onClick={resetFlow}>
                    Try Again
                  </button>
                </div>
              )}

              {step === STEPS.RESULT && result && (
                <div>
                  <div className="sa-result-hero">
                    <h3 className="sa-result-condition">{result.condition}</h3>
                    <p className="sa-result-conf">AI confidence: {result.confidence}%</p>
                    <div className="sa-conf-bar">
                      <div className="sa-conf-bar-fill" style={{ width: `${Math.max(0, Math.min(100, result.confidence || 0))}%` }}></div>
                    </div>
                    <div className="sa-badge-row">
                      {result.severity && <span className={`sa-badge sev-${result.severity}`}>{result.severity} severity</span>}
                      {result.urgency && <span className={`sa-badge urg-${result.urgency}`}>{result.urgency} urgency</span>}
                    </div>
                  </div>

                  {result.concerns?.length > 0 && (
                    <>
                      <p className="sa-list-title">What we noticed</p>
                      <ul className="sa-list">
                        {result.concerns.map((c, i) => (
                          <li key={i}><i className="fa-solid fa-circle-dot"></i> {c}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {result.recommendations?.length > 0 && (
                    <>
                      <p className="sa-list-title">Recommendations</p>
                      <ul className="sa-list">
                        {result.recommendations.map((r, i) => (
                          <li key={i}><i className="fa-solid fa-leaf"></i> {r}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="sa-disclaimer">
                    <i className="fa-solid fa-circle-info"></i>
                    {result.disclaimer || "This is an AI-generated general assessment, not a medical diagnosis. See a dermatologist for anything persistent or concerning."}
                  </div>

                  <div className="sa-result-actions">
                    {user ? (
                      <button className="btn-ghost" onClick={saveResult} disabled={saveState !== "idle"}>
                        <i className="fa-solid fa-bookmark"></i>{" "}
                        {saveState === "saved" ? "Saved to your journal" : saveState === "saving" ? "Saving…" : "Save to My Journal"}
                      </button>
                    ) : (
                      <span className="sa-save-hint">Log in to save this to your skin journal.</span>
                    )}
                    <button className="btn-solid" onClick={resetFlow}>
                      Analyse Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
