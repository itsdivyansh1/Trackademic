"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getFormSubmissions } from "@/lib/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function FormSubmissionsPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { data } = useQuery({ queryKey: ["form", slug, "submissions"], queryFn: () => getFormSubmissions(slug) });

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions for {data.form.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted At</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Answers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{s.user.name}</div>
                    <div className="text-xs text-muted-foreground">{s.user.email}</div>
                    {s.user.stdId && <div className="text-xs text-muted-foreground">{s.user.stdId}</div>}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-sm">
                      {s.answers.map((a) => (
                        <li key={a.id}>
                          <span className="font-medium">{a.field.label}:</span> {typeof a.value === "object" ? JSON.stringify(a.value) : String(a.value)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
              {!data.submissions.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}