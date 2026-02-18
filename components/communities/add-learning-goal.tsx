import { LockIcon, PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useCreateLearningGoal } from "@/hooks/use-goals";

export default function AddLearningGoal({
  selectedCommunityId,
  showLockIcon,
}: {
  selectedCommunityId: string;
  showLockIcon: boolean;
}) {
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const createGoalMutation = useCreateLearningGoal();

  const handleCreateGoal = async () => {
    try {
      await createGoalMutation.mutateAsync({
        communityId: selectedCommunityId,
        title: newGoalText.slice(0, 100),
        description: newGoalText,
        tags: [],
      });
      setNewGoalText("");
      setShowNewGoalForm(false);
    } catch (error) {
      console.error("Error creating learning goal", error);
    }
  };

  return (
    <div>
      {showNewGoalForm ? (
        <div className="space-y-3 pt-3 border-t">
          <Textarea
            placeholder="What do you want to learn?"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateGoal}
              disabled={
                createGoalMutation.isPending ||
                newGoalText.length === 0 ||
                showLockIcon
              }
            >
              Add Goal
            </Button>
            <Button
              size="sm"
              variant={"outline"}
              onClick={() => setShowNewGoalForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => setShowNewGoalForm(true)}
          disabled={showLockIcon}
        >
          {showLockIcon && (
            <LockIcon className="size-4 text-muted-foreground" />
          )}
          <PlusIcon className="size-3" /> Add Learning Goal
        </Button>
      )}
    </div>
  );
}
