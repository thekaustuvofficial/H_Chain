import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { DEPARTMENTS } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  Activity,
  Pill,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';
type ReportCategory = 'patients' | 'prescriptions' | 'departments' | 'performance';

export default function Reports() {
  const { state } = useQueue();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [reportCategory, setReportCategory] = useState<ReportCategory>('patients');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const getTimeRange = () => {
      switch (reportType) {
        case 'daily': return oneDayAgo;
        case 'weekly': return oneWeekAgo;
        case 'monthly': return oneMonthAgo;
        default: return oneDayAgo;
      }
    };

    const timeRange = getTimeRange();

    // Filter patients by time range and department
    const filteredPatients = state.patients.filter(p => {
      const matchesTime = p.arrivalTime >= timeRange;
      const matchesDept = selectedDepartment === 'all' || p.department === selectedDepartment;
      return matchesTime && matchesDept;
    });

    // Filter prescriptions
    const filteredPrescriptions = state.prescriptions.filter(p => {
      const matchesTime = p.createdAt >= timeRange;
      const matchesDept = selectedDepartment === 'all' || p.department === selectedDepartment;
      return matchesTime && matchesDept;
    });

    // Calculate metrics
    const totalPatients = filteredPatients.length;
    const completedPatients = filteredPatients.filter(p => p.status === 'completed').length;
    const emergencyPatients = filteredPatients.filter(p => p.isEmergency).length;
    const averageWaitTime = filteredPatients.length > 0
      ? filteredPatients.reduce((sum, p) => {
          if (p.consultationEndTime) {
            return sum + (p.consultationEndTime - p.arrivalTime);
          }
          return sum;
        }, 0) / filteredPatients.filter(p => p.consultationEndTime).length
      : 0;

    // Prescription metrics
    const totalPrescriptions = filteredPrescriptions.length;
    const dispensedPrescriptions = filteredPrescriptions.filter(p => p.status === 'dispensed').length;
    const pendingPrescriptions = filteredPrescriptions.filter(p => p.status === 'pending').length;
    const forwardedPrescriptions = filteredPrescriptions.filter(p => p.status === 'forwarded').length;

    // Department breakdown
    const departmentStats = DEPARTMENTS.map(dept => {
      const deptPatients = filteredPatients.filter(p => p.department === dept.id);
      const deptPrescriptions = filteredPrescriptions.filter(p => p.department === dept.id);
      return {
        department: dept.name,
        patients: deptPatients.length,
        completed: deptPatients.filter(p => p.status === 'completed').length,
        prescriptions: deptPrescriptions.length,
        dispensed: deptPrescriptions.filter(p => p.status === 'dispensed').length,
      };
    });

    return {
      totalPatients,
      completedPatients,
      emergencyPatients,
      averageWaitTime,
      totalPrescriptions,
      dispensedPrescriptions,
      pendingPrescriptions,
      forwardedPrescriptions,
      departmentStats,
      completionRate: totalPatients > 0 ? (completedPatients / totalPatients * 100).toFixed(1) : '0',
      dispensingRate: totalPrescriptions > 0 ? (dispensedPrescriptions / totalPrescriptions * 100).toFixed(1) : '0',
    };
  }, [state, reportType, selectedDepartment]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = {
        type: reportType,
        category: reportCategory,
        department: selectedDepartment,
        generatedAt: new Date().toISOString(),
        stats,
      };

      // Create a downloadable JSON report
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `healthqueue-report-${reportType}-${Date.now()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setIsGenerating(false);
      toast.success('Report generated successfully');
    }, 1500);
  };

  const exportToPDF = () => {
    toast.info('PDF export feature coming soon');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            </div>
            <p className="text-muted-foreground">
              Generate comprehensive reports and view system analytics
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Report Configuration</CardTitle>
              <CardDescription>Select report parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={reportCategory} onValueChange={(v) => setReportCategory(v as ReportCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patients">Patients</SelectItem>
                      <SelectItem value="prescriptions">Prescriptions</SelectItem>
                      <SelectItem value="departments">Departments</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateReport}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">{stats.totalPatients}</Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
                <p className="text-2xl font-bold">{stats.completedPatients} completed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Pill className="w-8 h-8 text-green-500" />
                  <Badge variant="secondary">{stats.totalPrescriptions}</Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Prescriptions</h3>
                <p className="text-2xl font-bold">{stats.dispensedPrescriptions} dispensed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.dispensingRate}% dispensing rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Avg Wait Time</h3>
                <p className="text-2xl font-bold">
                  {stats.averageWaitTime > 0 ? formatTime(stats.averageWaitTime) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per consultation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <Badge variant="destructive">{stats.emergencyPatients}</Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Emergency Cases</h3>
                <p className="text-2xl font-bold">{stats.emergencyPatients}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Performance metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.departmentStats.map((dept, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{dept.department}</h4>
                      <Badge variant="outline">{dept.patients} patients</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">{dept.completed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prescriptions</p>
                        <p className="font-medium">{dept.prescriptions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dispensed</p>
                        <p className="font-medium">{dept.dispensed}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Completion Progress</span>
                        <span className="font-medium">
                          {dept.patients > 0 ? ((dept.completed / dept.patients) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ 
                            width: dept.patients > 0 
                              ? `${(dept.completed / dept.patients) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prescription Status */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Status Overview</CardTitle>
              <CardDescription>Current prescription pipeline status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold">Pending</h4>
                  </div>
                  <p className="text-3xl font-bold">{stats.pendingPrescriptions}</p>
                  <p className="text-sm text-muted-foreground">Awaiting verification</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold">Forwarded</h4>
                  </div>
                  <p className="text-3xl font-bold">{stats.forwardedPrescriptions}</p>
                  <p className="text-sm text-muted-foreground">At medicine dept</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold">Dispensed</h4>
                  </div>
                  <p className="text-3xl font-bold">{stats.dispensedPrescriptions}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={generateReport} disabled={isGenerating}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => toast.info('CSV export coming soon')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
