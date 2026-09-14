const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminReports.tsx', 'utf-8');

if (!content.includes('downloadCSV')) {
    // Add imports
    content = content.replace(
        'import { Users, UserPlus, CreditCard } from "lucide-react";',
        'import { Users, UserPlus, CreditCard, Download } from "lucide-react";\nimport { downloadCSV } from "../../lib/exportUtils";\nimport toast from "react-hot-toast";'
    );
    if (!content.includes('import toast')) {
        content = content.replace('import { useAuth } from', 'import toast from "react-hot-toast";\nimport { useAuth } from');
    }
    if (!content.includes('import { Download }')) {
        content = content.replace('import { Users', 'import { Download, Users');
        content = content.replace('import { downloadCSV }', 'import { downloadCSV } from "../../lib/exportUtils";\n');
    }
    
    // Inject logic
    const logic = `
  const [exporting, setExporting] = useState(false);

  const exportAttendance = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "attendance"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          Date: d.date,
          Class: d.class,
          Section: d.section,
          TeacherId: d.teacherId,
          TotalRecords: d.records?.length || 0,
        };
      });
      if (data.length === 0) { toast.error("No attendance records found"); return; }
      downloadCSV(data, "Attendance_Report.csv");
      toast.success("Attendance report exported");
    } catch (e) {
      toast.error("Error exporting attendance");
    } finally {
      setExporting(false);
    }
  };

  const exportAcademic = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "results"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          StudentId: d.studentId,
          ExamId: d.examId,
          Total: d.total,
          Percentage: d.percentage,
          Grade: d.grade,
        };
      });
      if (data.length === 0) { toast.error("No academic records found"); return; }
      downloadCSV(data, "Academic_Report.csv");
      toast.success("Academic report exported");
    } catch (e) {
      toast.error("Error exporting academic");
    } finally {
      setExporting(false);
    }
  };

  const exportFees = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "fees"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          StudentId: d.studentId,
          AcademicYear: d.academicYear,
          TotalAmount: d.totalAmount,
          PaidAmount: d.paidAmount,
          PendingAmount: d.pendingAmount,
          Status: d.status,
          DueDate: d.dueDate,
        };
      });
      if (data.length === 0) { toast.error("No fee records found"); return; }
      downloadCSV(data, "Fee_Report.csv");
      toast.success("Fee report exported");
    } catch (e) {
      toast.error("Error exporting fees");
    } finally {
      setExporting(false);
    }
  };
`;
    content = content.replace('useEffect(() => {', logic + '\n  useEffect(() => {');
    
    // Inject UI
    const ui = `
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Data Export</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={exportAttendance} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Attendance
          </button>
          <button onClick={exportAcademic} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Academic
          </button>
          <button onClick={exportFees} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Fees
          </button>
        </div>
      </div>
`;
    content = content.replace('    </div>\n  );\n}', ui + '    </div>\n  );\n}');

    fs.writeFileSync('src/pages/admin/AdminReports.tsx', content);
}
