'use client'

import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import * as faceapi from "face-api.js";

import { useTheme } from '../../../../contexts/ThemeContext';
import { useToast } from '../../../../contexts/ToastContext';

import { loadFaceModels } from "../../../../utils/loadFaceModels.client";
import { matchFacesClient } from "../../../../utils/matchFaces.client";

const getColor = (count:number) => {
  if(count === 0) return "#e5e7eb";
  if(count < 3) return "#9be9a8";
  if(count < 6) return "#40c463";
  if(count < 9) return "#30a14e";
  return "#216e39";
};

export default function GitAndFace() {
  const { theme } = useTheme();
  const { success, error } = useToast();

  const [data,setData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cameraReady,setCameraReady] = useState(false);
  const [isCheckedIn,setIsCheckedIn] = useState(false);
  const [workingHours, setWorkingHours] = useState(0);
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const profileImgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ------------------ LOAD FACE MODELS (ONCE) ------------------
  useEffect(() => {
    loadFaceModels()
      .then(() => console.log("✅ Face models loaded (client)"))
      .catch(() => error("Face models load nahi ho paaye"));
  }, []);

  // ------------------ AUTH CHECK ------------------
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      window.location.href = '/landing/auth/login';
    }
  }, []);

  // ------------------ GIT DATA ------------------
  useEffect(() => {
    const userCookie = Cookies.get("user");
    if(!userCookie) return;

    const user = JSON.parse(userCookie);

    fetch("/api/attendance/git-track",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ email:user.email })
    })
    .then(res=>res.json())
    .then(d=>{
      if(d.success) setData(d.data);
    });
  },[]);

  // ------------------ FETCH ATTENDANCE ------------------
  const fetchAttendance = async () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) return;

    const user = JSON.parse(userCookie);
    const res = await fetch(`/api/attendance/get-attendance?email=${user.email}`);
    const result = await res.json();

    if(result.success){
      setAttendancePercentage(result.data.percentage);
      setIsCheckedIn(result.data.todayEntry);
      setAttendanceData(result.data);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (Cookies.get('checkin_time')) setIsCheckedIn(true);
  }, []);

  // ------------------ WORKING HOURS ------------------
  const calculateWorkingHours = () => {
    let entryTime: Date | null = null;

    const cookieTime = Cookies.get('checkin_time');
    if (cookieTime) entryTime = new Date(cookieTime);

    if (!entryTime && attendanceData?.records) {
      const today = new Date().toISOString().split('T')[0];
      const rec = attendanceData.records.find((r:any)=>r.date===today);
      if (rec?.entryTime) {
        const [time, meridian] = rec.entryTime.split(' ');
        let [hh, mm] = time.split(':').map(Number);
        if (meridian === 'PM' && hh !== 12) hh += 12;
        if (meridian === 'AM' && hh === 12) hh = 0;
        entryTime = new Date();
        entryTime.setHours(hh, mm, 0, 0);
      }
    }

    if (!entryTime) return;

    const diff = (Date.now() - entryTime.getTime()) / (1000 * 60 * 60);
    const hours = Math.min(Math.max(0, diff), 7);
    setWorkingHours(hours);

    if (hours >= 7 && !hasNotifiedCompletion) {
      setShowCompletionPopup(true);
      setHasNotifiedCompletion(true);
      setTimeout(()=>setShowCompletionPopup(false),2000);
    }
  };

  useEffect(() => {
    if(!isCheckedIn || !attendanceData?.records) return;
    calculateWorkingHours();
    intervalRef.current = setInterval(calculateWorkingHours, 600000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isCheckedIn, attendanceData]);

  // ------------------ CAMERA ------------------
  const startCamera = async () => {
    setShowCamera(true);
    setCameraReady(false);

    setTimeout(async () => {
      try{
        const stream = await navigator.mediaDevices.getUserMedia({
          video:{ width:{ideal:640}, height:{ideal:480}, facingMode:"user" }
        });
        if(!videoRef.current) return;
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }catch{
        error("Camera open nahi ho raha");
      }
    },500);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t=>t.stop());
    streamRef.current=null;
    setShowCamera(false);
    setCountdown(0);
  };

  // ------------------ CAPTURE & VERIFY ------------------
  const captureAndMarkAttendance = async () => {
    if(!cameraReady) return error("Camera ready nahi hai");

    setCountdown(2);
    let t=2;
    const timer = setInterval(()=>{
      t--; setCountdown(t);
      if(t===0){ clearInterval(timer); takePhoto(); }
    },1000);
  };

  const takePhoto = async () => {
    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current!.videoWidth;
    canvas.height = videoRef.current!.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current!,0,0);

    const imageData = canvas.toDataURL("image/jpeg");

    const liveImg = new Image();
    liveImg.src = imageData;
    await new Promise(res => liveImg.onload = res);

    if(!profileImgRef.current){
      error("Profile image missing");
      setLoading(false);
      return;
    }

    const match = await matchFacesClient(liveImg, profileImgRef.current);
    if(!match.success || !match.match){
      error("Face mismatch");
      setLoading(false);
      stopCamera();
      return;
    }

    const user = JSON.parse(Cookies.get("user")!);
    const apiUrl = isCheckedIn
      ? "/api/attendance/face-checkout"
      : "/api/attendance/face-attendance";

    const res = await fetch(apiUrl,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ email:user.email, verified:true })
    });

    const result = await res.json();

    if(result.success){
      if(!isCheckedIn) Cookies.set('checkin_time', new Date().toISOString(), {expires:1});
      else Cookies.remove('checkin_time');

      success(isCheckedIn ? "Checked Out ✔" : "Attendance Marked ✔");
      await fetchAttendance();
    } else {
      error(result.message);
    }

    setLoading(false);
    stopCamera();
  };

  if(!data) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-4xl shadow border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-6 transition-colors`}>
        <div className="animate-pulse">
          <div className={`h-6 bg-gray-300 rounded w-1/3 mb-4`}></div>
          <div className="flex gap-6">
            <div className="flex space-x-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-gray-300 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

return (
  <>
  <img
  ref={profileImgRef}
  src={JSON.parse(Cookies.get("user") || "{}")?.profilePicture}
  alt="profile"
  crossOrigin="anonymous"
  style={{ display: "none" }}
/>


    {/* MAIN CARD */}
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-4xl shadow border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-6 transition-colors`}>

      <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Git & Face Attendance
      </h2>

      <div className="flex gap-6">

        {/* GIT GRAPH */}
        <div className="flex overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {data.months.map((month:any, mi:number)=>(
            <div key={mi} className="flex">
              <div>
                <p className={`text-xs font-semibold mb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {month.month}
                </p>

                <div className="flex gap-1">
                  {month.weeks.map((week:any, wi:number)=>(
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day:any, di:number)=>(
                        <div
                          key={di}
                          className="w-4 h-4 rounded-sm"
                          style={{ background:getColor(day.count) }}
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mx-3 border-r"></div>
            </div>
          ))}
        </div>

        {/* FACE CARD */}
        <div className={`w-130 -mt-15 -mb-4 bg-[#00c950] rounded-2xl p-2 shadow transition-colors`}>

          <button
            onClick={() => {
              startCamera();
            }}
            className={`w-full mb-4 py-2 rounded-lg text-white
              ${isCheckedIn ? "bg-red-600" : "bg-blue-600"}`}
          >
            {isCheckedIn ? "🚪 Check Out" : "📸 Check In"}
          </button>
          <div className={`rounded-2xl p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Attendance
          </p>

          <h3 className="text-xl font-bold text-blue-600 text-center">
            {attendancePercentage}%
          </h3>

          {/* Working Hours */}
          {isCheckedIn && (
            <div className={` p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {workingHours >= 7 ? "Completed Hours" : "Working Hours"}
                </span>
                <span className={`text-sm font-bold text-blue-600`}>
                  {workingHours.toFixed(1)} / 7 hrs
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(workingHours / 7) * 100}%` }}
                ></div>
              </div>

              {workingHours >= 7 && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ 7 hours completed
                </p>
              )}
            </div>
          )}

          {/* TODAY RECORD */}
          {attendanceData?.records && (
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>

              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Today's Record
              </p>

              {(() => {
                const today = new Date().toISOString().split("T")[0];

                const todayRecord = attendanceData.records.find(
                  (r:any)=>r.date===today
                );

                if (todayRecord) {
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Entry: {todayRecord.entryTime || 'Not marked'}
                        </span>
                      </div>

                      {todayRecord.exitTime && (
                        <div className="flex justify-between text-xs">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            Exit: {todayRecord.exitTime}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <p className={`text-xs text-gray-500`}>
                    No attendance record for today
                  </p>
                );
              })()}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>

    {/* CAMERA MODAL */}
    {showCamera && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

        <div className={`rounded-xl p-6 w-[420px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>

          <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isCheckedIn ? "Check Out" : "Face Verification"}
          </h3>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-black"
          />

          {!cameraReady && (
            <p className={`text-center text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Camera loading...
            </p>
          )}

          {countdown>0 && (
            <p className="text-center text-xl font-bold text-blue-600 mt-3">
              Capturing in {countdown}
            </p>
          )}

          {loading && (
            <p className="text-center mt-2">
              Verifying...
            </p>
          )}

          <div className="flex gap-3 mt-4">

            <button
              onClick={stopCamera}
              className={`flex-1 border rounded-lg py-2 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>

            <button
              onClick={captureAndMarkAttendance}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2"
            >
              Capture
            </button>

          </div>
        </div>
      </div>
      )}

      {/* WORKING HOURS COMPLETION POPUP */}
      {showCompletionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-lg">Working Hours Completed!</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
