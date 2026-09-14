import { NextResponse } from "next/server";
import { exportToExcelBuffer } from "@/lib/services/comps-spatial-service";

export async function GET() {
  const buffer = exportToExcelBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="Bank_Data_Penilaian_Properti.xlsx"',
    },
  });
}
