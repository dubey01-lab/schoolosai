import React from "react";
import { Link } from "react-router-dom";
import { Save, Bell, Smartphone, Mail, MessageSquare } from "lucide-react";

export default function AdminSettingsNotifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notification Preferences</h2>
        <p className="text-slate-500 mt-1">Configure how and when your school communicates.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Communication Channels</h3>
          <p className="text-sm text-slate-500">Enable or disable delivery methods for notifications.</p>
        </div>
        <div className="p-6 space-y-6">
           <ChannelToggle icon={Bell} title="In-App Notifications" description="Deliver alerts inside the SchoolOS dashboard." defaultChecked={true} disabled={true} />
           <ChannelToggle icon={Mail} title="Email Notifications" description="Send daily summaries and important alerts via email." defaultChecked={true} />
           <ChannelToggle icon={MessageSquare} title="WhatsApp Integration" description="Send instant alerts directly to parents' WhatsApp." defaultChecked={false} badge="Premium" />
           <ChannelToggle icon={Smartphone} title="SMS Delivery" description="Send traditional text messages as a fallback." defaultChecked={true} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Automated Events</h3>
          <p className="text-sm text-slate-500">Configure which system events automatically trigger communications.</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="py-3 pr-6 w-[40%]">Event Trigger</th>
                  <th className="py-3 px-4 text-center">Parents</th>
                  <th className="py-3 px-4 text-center">Teachers</th>
                  <th className="py-3 pl-4 text-center">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <EventRow title="Student Marked Absent" parents={true} teachers={true} students={false} />
                <EventRow title="Fee Overdue Alert" parents={true} teachers={false} students={false} />
                <EventRow title="Homework Posted" parents={true} teachers={false} students={true} />
                <EventRow title="Exam Result Published" parents={true} teachers={true} students={true} />
                <EventRow title="New Notice Published" parents={true} teachers={true} students={true} />
                <EventRow title="New Admission Enquiry" parents={false} teachers={false} students={false} isAdminEvent={true} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors">Discard Changes</button>
        <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>
    </div>
  );
}

function ChannelToggle({ icon: Icon, title, description, defaultChecked, disabled = false, badge }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900">{title}</h4>
            {badge && <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} disabled={disabled} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
      </label>
    </div>
  );
}

function EventRow({ title, parents, teachers, students, isAdminEvent = false }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="py-4 pr-6">
        <span className="text-sm font-medium text-slate-700">{title}</span>
        {isAdminEvent && <span className="block text-xs text-slate-400 mt-0.5">Alerts sent to School Admin</span>}
      </td>
      <td className="py-4 px-4 text-center">
        {!isAdminEvent && <input type="checkbox" defaultChecked={parents} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />}
      </td>
      <td className="py-4 px-4 text-center">
        {!isAdminEvent && <input type="checkbox" defaultChecked={teachers} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />}
      </td>
      <td className="py-4 pl-4 text-center">
        {!isAdminEvent && <input type="checkbox" defaultChecked={students} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />}
      </td>
    </tr>
  );
}
