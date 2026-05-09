import React, { memo, useState } from "react";

const TrackView = memo(({ t, bookings }) => {
  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState(null);

  const handleTrack = () => {
    const searchTerm = trackPhone.trim();
    if (!searchTerm) {
      setTrackResult(null);
      return;
    }
    setTrackResult(
      bookings.filter(
        (b) => b.phone?.includes(searchTerm) || b.room === searchTerm,
      ),
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center animate-fade-in">
      <div className="bg-white dark:bg-stone-800 p-10 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-stone-700">
        <h2 className="text-3xl font-bold mb-6 text-brand-blue dark:text-brand-orange">
          {t.trackTitle}
        </h2>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder={t.trackPlaceholder}
            className="w-full p-5 rounded-2xl border border-stone-200 dark:border-stone-600 dark:bg-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange font-bold text-center text-lg"
            value={trackPhone}
            onChange={(e) => setTrackPhone(e.target.value)}
          />
        </div>
        <button
          onClick={handleTrack}
          className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-bold text-xl w-full hover:bg-brand-orangeHover shadow-lg transition-all"
        >
          {t.trackBtn}
        </button>

        {trackResult && (
          <div className="mt-10 text-start space-y-4">
            {trackResult.length === 0 ? (
              <p className="text-stone-500 dark:text-stone-400 text-center font-bold">
                {t.trackNotFound}
              </p>
            ) : (
              trackResult.map((b) => (
                <div
                  key={b.id}
                  className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl shadow-sm border-r-4 border-brand-orange"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-black text-lg dark:text-white">
                      {b.date} - {b.time}
                    </p>
                    <div
                      className={`px-4 py-1 rounded-full text-sm font-bold ${
                        b.status === "pending"
                          ? "bg-orange-100 text-orange-600"
                          : b.status === "confirmed"
                            ? "bg-blue-100 text-blue-600"
                            : b.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                      }`}
                    >
                      {b.status === "pending"
                        ? t.statusPending
                        : b.status === "confirmed"
                          ? t.statusConfirmed
                          : b.status === "completed"
                            ? t.statusCompleted
                            : t.statusCancelled}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-stone-500 dark:text-stone-400 mb-2">
                    {b.restaurant} | {t.roomNumber}: {b.room}
                  </p>
                  <p className="text-stone-600 dark:text-stone-300 text-sm whitespace-pre-wrap">
                    {b.orderDetails}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TrackView;
