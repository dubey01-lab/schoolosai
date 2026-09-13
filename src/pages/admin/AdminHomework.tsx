import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Homework, Teacher } from "../../types";
import { BookOpen, Search, Filter, Clock, Users, BookMarked } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminHomework() {
  const { userData } = useAuth();
  const [homeworks, setHomeworks] = useState<(Homework & { teacherName?: string })[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    const fetchHomeworkAndTeachers = async () => {
      if (!userData?.schoolId) return;
      try {
        // Fetch teachers to map IDs to names
        const tQ = query(collection(db, "teachers"), where("schoolId", "==", userData.schoolId));
        const tSnap = await getDocs(tQ);
        const tMap: Record<string, string> = {};
        tSnap.docs.forEach(d => {
          tMap[d.id] = d.data().name;
        });
        setTeachers(tMap);

        // Fetch all homeworks for the school
        const hwQ = query(collection(db, "homework"), where("schoolId", "==", userData.schoolId));
        const hwSnap = await getDocs(hwQ);
        
        const fetchedHomeworks = hwSnap.docs.map(d => {
          const data = d.data() as Homework;
          return {
            id: d.id,
            ...data,
            teacherName: tMap[data.teacherId] || 'Unknown Teacher'
          };
        });
        
        fetchedHomeworks.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setHomeworks(fetchedHomeworks);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load homework data");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkAndTeachers();
  }, [userData]);

  const filteredHomeworks = homeworks.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hw.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (hw.teacherName && hw.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = filterClass ? `${hw.class}-${hw.section}` === filterClass : true;
    
    return matchesSearch && matchesClass;
  });

  // Extract unique classes for filter dropdown
  const uniqueClasses = Array.from(new Set(homeworks.map(h => `${h.class}-${h.section}`))).sort();

  if (loading) return <div className="p-8 text-center text-slate-500">Loading assignments...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">School-wide Assignments</h2>
            <p className="text-slate-500 mt-1">Monitor homework assigned across all classes</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, subject, or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>Class {c.replace('-', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomeworks.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Assignments Found</h3>
            <p className="text-slate-500">There are no homework assignments matching your criteria.</p>
          </div>
        ) : (
          filteredHomeworks.map(hw => {
            const isPastDue = new Date(hw.dueDate) < new Date(new Date().setHours(0,0,0,0));
            
            return (
              <div key={hw.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                      Class {hw.class}-{hw.section}
                    </span>
                    <span className={`px-3 py-1 font-bold text-xs rounded-lg border ${
                      isPastDue 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {isPastDue ? 'Past Due' : 'Active'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2" title={hw.title}>{hw.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">{hw.description}</p>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">Assigned by:</span> {hw.teacherName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Subject:</span> {hw.subject}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Due:</span> {new Date(hw.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
