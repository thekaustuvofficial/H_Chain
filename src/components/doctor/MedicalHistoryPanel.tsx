import { Patient } from '@/types/queue';
import { generateMedicalHistory, MedicalHistory } from '@/lib/medical-history-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Calendar, 
  Pill, 
  Activity,
  FileText,
  User,
  TrendingUp
} from 'lucide-react';

interface MedicalHistoryPanelProps {
  patient: Patient;
}

export function MedicalHistoryPanel({ patient }: MedicalHistoryPanelProps) {
  const history: MedicalHistory = generateMedicalHistory(patient);
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      default: return 'bg-green-500/10 text-green-600 border-green-500/30';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {/* Patient Summary */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{patient.name}</span>
                </div>
                <Badge variant="outline" className={getRiskColor(history.riskLevel)}>
                  {history.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Age:</span>{' '}
                  <span className="font-medium">{patient.age}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Token:</span>{' '}
                  <span className="font-mono text-xs">{patient.tokenNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Department:</span>{' '}
                  <span className="font-medium capitalize">{patient.department.replace('_', ' ')}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Visit Type:</span>{' '}
                  <span className="font-medium capitalize">{patient.visitType}</span>
                </div>
              </div>
            </div>

            {/* Visit History */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Visit History
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">Total Visits</span>
                    <Badge variant="secondary">{history.visitCount}</Badge>
                  </div>
                  {history.lastVisit && (
                    <p className="text-xs text-muted-foreground">
                      Last visit: {history.lastVisit}
                    </p>
                  )}
                  {history.visitCount === 0 && (
                    <p className="text-xs text-muted-foreground">
                      First visit to this department
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Symptoms */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Current Complaint
              </h4>
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">{patient.symptom}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Severity: <span className="capitalize">{patient.symptomSeverity}</span>
                </p>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Allergies
              </h4>
              <div className="p-3 rounded-lg border bg-card">
                {history.allergies.map((allergy, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {allergy === 'None known' ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        {allergy}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">{allergy}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Chronic Conditions
              </h4>
              <div className="p-3 rounded-lg border bg-card">
                {history.chronicConditions.map((condition, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {condition === 'None' ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        {condition}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                        {condition}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Diagnoses */}
            {history.previousDiagnoses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Previous Diagnoses
                </h4>
                <div className="space-y-1">
                  {history.previousDiagnoses.map((diagnosis, idx) => (
                    <div key={idx} className="p-2 rounded border bg-card text-sm">
                      {diagnosis}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Medications */}
            {history.previousMedications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Previous Medications
                </h4>
                <div className="space-y-1">
                  {history.previousMedications.map((medication, idx) => (
                    <div key={idx} className="p-2 rounded border bg-card text-sm flex items-center gap-2">
                      <Pill className="w-3 h-3 text-muted-foreground" />
                      {medication}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerability Flags */}
            {(patient.vulnerabilities.elderly || 
              patient.vulnerabilities.pregnant || 
              patient.vulnerabilities.disabled || 
              patient.vulnerabilities.chronicCondition) && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Special Considerations</h4>
                <div className="flex flex-wrap gap-2">
                  {patient.vulnerabilities.elderly && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                      Elderly (60+)
                    </Badge>
                  )}
                  {patient.vulnerabilities.pregnant && (
                    <Badge variant="outline" className="bg-pink-500/10 text-pink-600">
                      Pregnant
                    </Badge>
                  )}
                  {patient.vulnerabilities.disabled && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
                      Disabled
                    </Badge>
                  )}
                  {patient.vulnerabilities.chronicCondition && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                      Chronic Condition
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-600 font-medium mb-1">
                ⓘ Medical History Note
              </p>
              <p className="text-xs text-muted-foreground">
                This is simulated medical history for demonstration purposes. 
                In production, real patient records would be displayed here.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
