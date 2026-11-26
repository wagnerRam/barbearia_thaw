
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      professional_id,
      service_id,
      start_at,
      client_name,
      client_phone,
      client_email,
      notes,
    } = body;

    if (
      !professional_id ||
      !service_id ||
      !start_at ||
      !client_name ||
      !client_phone
    ) {
      return NextResponse.json(
        { error: "Preencha os dados obrigatórios do agendamento." },
        { status: 400 }
      );
    }

    const startDate = new Date(start_at);

    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Data ou horário inválido." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "create_public_appointment",
      {
        p_professional_id: professional_id,
        p_service_id: service_id,
        p_start_at: startDate.toISOString(),
        p_client_name: client_name,
        p_client_phone: client_phone,
        p_client_email: client_email || null,
        p_notes: notes || null,
      }
    );

    if (error) {
      console.error("Erro ao criar agendamento:", error);

      const conflict =
        error.message.includes("acabou de ser reservado");

      return NextResponse.json(
        {
          error: error.message || "Não foi possível realizar o agendamento.",
        },
        { status: conflict ? 409 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        appointment: data,
        message: "Agendamento realizado com sucesso!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro na API de agendamentos:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao processar o agendamento." },
      { status: 500 }
    );
  }
}
