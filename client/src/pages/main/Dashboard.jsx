import Sidebar from "../../components/main/SideBar";
import Header from "../../components/main/Header";
import DotsBackground from "../../components/main/DotsBackground";
import GoalCard from "../../components/main/dashboard/GoalCard";
import SessionList from "../../components/main/dashboard/SessionList";
import AddSessionModal from "../../components/main/dashboard/AddSessionModal";

import { useState } from "react";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <DotsBackground />

      <div className="relative z-10 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />

          <main className="p-6 space-y-8">
            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <GoalCard title="Active Goals" value="3" />
              <GoalCard title="Completion" value="68%" />
              <GoalCard title="Streak" value="5 days" />
            </div>

            {/* Today’s Tasks */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Today’s Tasks</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
                >
                  + Add Session
                </button>
              </div>
              <SessionList />
            </section>
          </main>
        </div>
      </div>

      <AddSessionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
