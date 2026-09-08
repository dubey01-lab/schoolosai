import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Download, IndianRupee, Clock, AlertCircle, TrendingUp, TrendingDown, Users, Receipt } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { StudentFee } from "../../types";
import { format } from "date-fns";

export default function AdminFees() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFees: 0,
    collected: 0,
    pending: 0,
    overdue: 0,
    thisMonth: 0,
    collectionRate: 0,
  });

  useEffect(() => {
    const fetchFeeData = async () => {
      if (!userData?.schoolId) return;
      try {
        const feesRef = collection(db, "fees");
        const q = query(feesRef, where("schoolId", "==", userData.schoolId));
        const querySnapshot = await getDocs(q);
        
        let total = 0;
        let collected = 0;
        let pending = 0;
        let overdue = 0;
        
        const now = new Date();

        querySnapshot.forEach((doc) => {
          const fee = doc.data() as StudentFee;
          total += fee.totalAmount;
          collected += fee.paidAmount;
          pending += fee.pendingAmount;
          
          if (new Date(fee.dueDate) < now && fee.pendingAmount > 0) {
            overdue += fee.pendingAmount;
          }
        });

        setStats({
          totalFees: total,
          collected,
          pending,
          overdue,
          thisMonth: collected,
          collectionRate: total > 0 ? Math.round((collected / total) * 100) : 0,
        });

      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeeData();
  }, [userData]);

  const StatCard = ({ title, amount, icon: Icon, color, trend, trendValue }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center \${color.bg}`}>
          <Icon className={`w-6 h-6 \${color.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full \${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fee Management</h2>
          <p className="text-slate-500 mt-1">Track collections, pending payments and student fee activity in one place.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <Link to="/admin/fees/structure" className="flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">
            <Receipt className="w-4 h-4" /> Fee Structure
          </Link>
          <Link to="/admin/fees/collect" className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Collect Fee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Expected Fees" 
          amount={stats.totalFees} 
          icon={IndianRupee} 
          color={{ bg: "bg-blue-100", text: "text-blue-600" }} 
        />
        <StatCard 
          title="Total Collected" 
          amount={stats.collected} 
          icon={IndianRupee} 
          color={{ bg: "bg-emerald-100", text: "text-emerald-600" }}
          trend="up"
          trendValue="12% vs last year"
        />
        <StatCard 
          title="Total Pending" 
          amount={stats.pending} 
          icon={Clock} 
          color={{ bg: "bg-amber-100", text: "text-amber-600" }} 
        />
        <StatCard 
          title="Overdue Amount" 
          amount={stats.overdue} 
          icon={AlertCircle} 
          color={{ bg: "bg-rose-100", text: "text-rose-600" }} 
        />
        <StatCard 
          title="Collected This Month" 
          amount={stats.thisMonth} 
          icon={IndianRupee} 
          color={{ bg: "bg-indigo-100", text: "text-indigo-600" }} 
          trend="up"
          trendValue="5% vs last month"
        />
        <StatCard 
          title="Collection Rate" 
          amount={stats.collectionRate + "%"} 
          icon={TrendingUp} 
          color={{ bg: "bg-purple-100", text: "text-purple-600" }} 
        />
      </div>

      {/* Analytics Charts View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 min-h-[400px] flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Collection Analytics</h3>
              <p className="text-sm text-slate-500">Monthly revenue tracking</p>
            </div>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 relative z-10 pt-10">
            {/* Chart Bars */}
            {[45, 30, 60, 40, 75, 55].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-2 group/bar cursor-pointer">
                <div className="w-full flex items-end gap-1 h-full">
                  <div className="w-1/2 bg-indigo-500 rounded-t-md transition-all duration-500 group-hover/bar:bg-indigo-600" style={{ height: `\${height}%` }}></div>
                  <div className="w-1/2 bg-rose-400 rounded-t-md transition-all duration-500 group-hover/bar:bg-rose-500" style={{ height: `\${height * 0.4}%` }}></div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500 group-hover/bar:text-slate-900 transition-colors">
                    {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Links</h3>
          <div className="space-y-3 flex-1">
            <Link to="/admin/fees/transactions" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Transactions</p>
                  <p className="text-xs text-slate-500">View payment history</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/fees/pending" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-rose-100 hover:bg-rose-50/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Pending Fees</p>
                  <p className="text-xs text-slate-500">Track outstanding dues</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/fees/reports" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Financial Reports</p>
                  <p className="text-xs text-slate-500">Generate detailed analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
