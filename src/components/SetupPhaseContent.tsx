import { CheckCircle2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StepDetail {
  id: string;
  number: string;
  title: string;
  status: "complete" | "in-progress" | "not-started";
  description: string;
  configured: string[];
  note?: string;
  responsible: string;
  completedDate?: string;
  completedBy?: string;
  actions: { label: string; onClick: () => void }[];
}

interface PhaseContentProps {
  phaseNumber: number;
  phaseTitle: string;
  phaseStatus: "complete" | "in-progress" | "not-started";
  phaseDescription: string;
  steps: StepDetail[];
  nextPhaseAction?: { label: string; onClick: () => void };
}

export default function SetupPhaseContent({
  phaseNumber,
  phaseTitle,
  phaseStatus,
  phaseDescription,
  steps,
  nextPhaseAction,
}: PhaseContentProps) {
  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              Phase {phaseNumber}: {phaseTitle}
            </h2>
            {phaseStatus === "complete" && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-3xl">{phaseDescription}</p>
        </div>
      </div>

      <Separator />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => (
          <Card key={step.id} className="p-6 space-y-4">
            {/* Step Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Step {step.number}: {step.title}
                  </h3>
                  {step.status === "complete" && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full bg-primary ${step.status === "complete" ? "w-full" : "w-0"}`} />
            </div>

            {/* What was configured */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">What you configured:</h4>
              <ul className="space-y-1.5">
                {step.configured.map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note */}
            {step.note && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-600 flex items-start gap-2">
                  <span className="font-semibold">⚠️ Note:</span>
                  <span>{step.note}</span>
                </p>
              </div>
            )}

            {/* Responsible & Completed */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>👤 Responsible:</span>
                <span className="font-medium text-foreground">{step.responsible}</span>
              </div>
              {step.completedDate && step.completedBy && (
                <div className="flex items-center gap-2">
                  <span>📅 Completed:</span>
                  <span className="font-medium text-foreground">
                    {step.completedDate} by {step.completedBy}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {step.actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="text-sm"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Next Phase Action */}
      {nextPhaseAction && phaseStatus === "complete" && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Phase {phaseNumber} Complete!
              </h3>
              <p className="text-sm text-muted-foreground">
                Great work! Your platform foundation is ready. You can now move to the next phase.
              </p>
            </div>
            <Button onClick={nextPhaseAction.onClick} size="lg">
              {nextPhaseAction.label}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
