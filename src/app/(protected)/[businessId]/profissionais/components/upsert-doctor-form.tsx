import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDoctor } from "@/actions/upsert-doctor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profissionaisTable } from "@/db/schema";
import { utcTimeToLocal } from "@/helpers/timezone";

// Função para gerar opções de horário de meia em meia hora
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push({
        value: timeString + ":00", // Formato HH:MM:SS
        label: timeString, // Formato HH:MM para exibição
      });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

interface Funcao {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: string;
}

type ProfissionalWithFuncoes = typeof profissionaisTable.$inferSelect & {
  profissionaisToFuncoes?: Array<{
    funcao: Funcao;
  }>;
};

const formSchema = z
  .object({
    name: z.string().trim().min(1, {
      message: "Nome é obrigatório.",
    }),
    funcoes: z.array(z.string()).min(1, {
      message: "Pelo menos uma função deve ser selecionada.",
    }),
    appointmentPrice: z.number().min(1, {
      message: "Salário é obrigatório.",
    }),
    availableFromWeekDay: z.string(),
    availableToWeekDay: z.string(),
    availableFromTime: z.string().min(1, {
      message: "Hora de início é obrigatória.",
    }),
    availableToTime: z.string().min(1, {
      message: "Hora de término é obrigatória.",
    }),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message:
        "O horário de início não pode ser anterior ao horário de término.",
      path: ["availableToTime"],
    },
  );

interface UpsertDoctorFormProps {
  isOpen: boolean;
  doctor?: ProfissionalWithFuncoes;
  funcoes: Funcao[];
  onSuccess?: () => void;
}

const UpsertDoctorForm = ({
  doctor,
  onSuccess,
  isOpen,
  funcoes,
}: UpsertDoctorFormProps) => {
  const selectedFuncoes =
    doctor?.profissionaisToFuncoes?.map((pf) => pf.funcao.id) || [];

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      funcoes: selectedFuncoes,
      appointmentPrice: doctor?.appointmentPriceInCents
        ? doctor.appointmentPriceInCents / 100
        : 0,
      availableFromWeekDay: doctor?.availableFromWeekDay?.toString() ?? "1",
      availableToWeekDay: doctor?.availableToWeekDay?.toString() ?? "5",
      availableFromTime: doctor?.availableFromTime
        ? utcTimeToLocal(doctor.availableFromTime)
        : "09:00:00",
      availableToTime: doctor?.availableToTime
        ? utcTimeToLocal(doctor.availableToTime)
        : "18:00:00",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const selectedFuncoes =
        doctor?.profissionaisToFuncoes?.map((pf) => pf.funcao.id) || [];
      form.reset({
        name: doctor?.name ?? "",
        funcoes: selectedFuncoes,
        appointmentPrice: doctor?.appointmentPriceInCents
          ? doctor.appointmentPriceInCents / 100
          : 0,
        availableFromWeekDay: doctor?.availableFromWeekDay?.toString() ?? "1",
        availableToWeekDay: doctor?.availableToWeekDay?.toString() ?? "5",
        availableFromTime: doctor?.availableFromTime
          ? utcTimeToLocal(doctor.availableFromTime)
          : "09:00:00",
        availableToTime: doctor?.availableToTime
          ? utcTimeToLocal(doctor.availableToTime)
          : "18:00:00",
      });
    }
  }, [isOpen, form, doctor]);

  const upsertDoctorAction = useAction(upsertDoctor, {
    onSuccess: () => {
      toast.success("Funcionário adicionado com sucesso.");
      onSuccess?.();
    },
    onError: ({ error }) => {
      // A mensagem de erro personalizada vem no serverError
      const errorMessage =
        error.serverError || "Erro ao adicionar funcionário.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertDoctorAction.execute({
      ...values,
      id: doctor?.id,
      availableFromWeekDay: parseInt(values.availableFromWeekDay),
      availableToWeekDay: parseInt(values.availableToWeekDay),
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  if (funcoes.length === 0) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {doctor ? doctor.name : "Adicionar funcionário"}
          </DialogTitle>
          <DialogDescription>
            {doctor
              ? "Edite as informações desse funcionário."
              : "Adicione um novo funcionário."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Coloque seu nome aqui" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="funcoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funções</FormLabel>
                  <div className="w-full">
                    <p className="text-muted-foreground text-sm">
                      Você precisa criar pelo menos uma função antes de
                      adicionar funcionários. Vá para a página{" "}
                      <a className="text-purple-500" href="/funcoes">
                        Funções
                      </a>
                      .
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentPrice"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Salário / Preço do Serviço</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      value={value}
                      onValueChange={(values) => {
                        onChange(values.floatValue || 0);
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="availableFromWeekDay"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Começo semana</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Dia da semana</SelectLabel>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda</SelectItem>
                          <SelectItem value="2">Terça</SelectItem>
                          <SelectItem value="3">Quarta</SelectItem>
                          <SelectItem value="4">Quinta</SelectItem>
                          <SelectItem value="5">Sexta</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableToWeekDay"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fim semana</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Dia da semana</SelectLabel>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda</SelectItem>
                          <SelectItem value="2">Terça</SelectItem>
                          <SelectItem value="3">Quarta</SelectItem>
                          <SelectItem value="4">Quinta</SelectItem>
                          <SelectItem value="5">Sexta</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="availableFromTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Hora início</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário de início" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableToTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Hora término</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário de término" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            form="form"
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={upsertDoctorAction.isExecuting}
          >
            {doctor ? "Editar" : "Adicionar"} funcionário
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {doctor ? doctor.name : "Adicionar funcionário"}
        </DialogTitle>
        <DialogDescription>
          {doctor
            ? "Edite as informações desse funcionário."
            : "Adicione um novo funcionário."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Coloque seu nome aqui" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="funcoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funções</FormLabel>
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                  {funcoes.map((funcao) => (
                    <FormItem
                      key={funcao.id}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(funcao.id)}
                          onCheckedChange={(checked) => {
                            const updatedFuncoes = checked
                              ? [...(field.value || []), funcao.id]
                              : (field.value || []).filter(
                                  (id) => id !== funcao.id,
                                );
                            field.onChange(updatedFuncoes);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        {funcao.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Preço do Serviço</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    value={value}
                    onValueChange={(values) => {
                      onChange(values.floatValue || 0);
                    }}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="availableFromWeekDay"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Começo semana</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Dia da semana</SelectLabel>
                        <SelectItem value="0">Domingo</SelectItem>
                        <SelectItem value="1">Segunda</SelectItem>
                        <SelectItem value="2">Terça</SelectItem>
                        <SelectItem value="3">Quarta</SelectItem>
                        <SelectItem value="4">Quinta</SelectItem>
                        <SelectItem value="5">Sexta</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableToWeekDay"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Fim semana</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Dia da semana</SelectLabel>
                        <SelectItem value="0">Domingo</SelectItem>
                        <SelectItem value="1">Segunda</SelectItem>
                        <SelectItem value="2">Terça</SelectItem>
                        <SelectItem value="3">Quarta</SelectItem>
                        <SelectItem value="4">Quinta</SelectItem>
                        <SelectItem value="5">Sexta</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="availableFromTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Hora início</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário de início" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableToTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Hora término</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário de término" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <DialogFooter>
        <Button
          className="my-3 mt-2 w-full"
          form="form"
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={upsertDoctorAction.isExecuting}
        >
          {doctor ? "Atualizar" : "Adicionar"} funcionário
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UpsertDoctorForm;
