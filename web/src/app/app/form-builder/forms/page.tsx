"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { deleteFormApi, listForms, listMyForms, updateFormApi } from "@/lib/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FormsListPage() {
  const qc = useQueryClient();
  const { data: allForms } = useQuery({ queryKey: ["forms", "all"], queryFn: listForms });
  const { data: myForms, error: myErr } = useQuery({ queryKey: ["forms", "mine"], queryFn: listMyForms });

  const toggleMutation = useMutation({
    mutationFn: (f: { id: string; isOpen: boolean }) => updateFormApi(f.id, { isOpen: !f.isOpen }),
    onSuccess: () => {
      toast.success("Form updated");
      qc.invalidateQueries({ queryKey: ["forms", "mine"] });
      qc.invalidateQueries({ queryKey: ["forms", "all"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFormApi(id),
    onSuccess: () => {
      toast.success("Form deleted");
      qc.invalidateQueries({ queryKey: ["forms", "mine"] });
      qc.invalidateQueries({ queryKey: ["forms", "all"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Button asChild>
          <Link href="/app/form-builder">Create new form</Link>
        </Button>
      </div>

      {/* My Forms (faculty/admin only; shows 403 otherwise) */}
      {!myErr && (
        <Card>
          <CardHeader>
            <CardTitle>My Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myForms?.map((f) => (
                <div key={f.id} className="rounded border p-4">
                  <div className="mb-2 text-lg font-semibold">{f.title}</div>
                  <div className="mb-2 text-sm text-muted-foreground">{f.description}</div>
                  <div className="mb-2 text-xs">Submissions: {f._count?.submissions ?? 0}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/app/form-builder/forms/${f.slug}`}>Open</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/app/form-builder/forms/${f.slug}/submissions`}>Submissions</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate({ id: f.id, isOpen: !!f.isOpen })}>
                      {f.isOpen ? "Close" : "Open"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(f.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {!myForms?.length && <div className="text-sm text-muted-foreground">No forms yet.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allForms?.map((f) => (
              <div key={f.id} className="rounded border p-4">
                <div className="mb-2 text-lg font-semibold">{f.title}</div>
                <div className="mb-2 text-sm text-muted-foreground">{f.description}</div>
                <div className="mb-2 text-xs">Status: {f.isOpen ? "Open" : "Closed"}</div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/app/form-builder/forms/${f.slug}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
            {!allForms?.length && <div className="text-sm text-muted-foreground">No forms available.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
