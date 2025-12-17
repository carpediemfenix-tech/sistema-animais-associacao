import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Voluntario {
  id: string;
  full_name: string;
  nickname?: string;
  short_name: string;
  display_name: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

interface VoluntarioSelectorProps {
  value?: string; // ID do voluntário selecionado
  onValueChange: (voluntarioId: string, voluntario?: Voluntario) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  showFullName?: boolean; // Mostrar full_name como tooltip/subtitle
}

const VoluntarioSelector: React.FC<VoluntarioSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Selecionar voluntário...",
  disabled = false,
  className = "",
  label,
  required = false,
  showFullName = false
}) => {
  const { toast } = useToast();
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadVoluntarios = async (termo: string = "") => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('buscar_voluntarios', { p_termo: termo });

      if (error) throw error;

      setVoluntarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de voluntários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoluntarios();
  }, []);

  const selectedVoluntario = voluntarios.find(v => v.id === value);

  const handleSelect = (voluntarioId: string) => {
    const voluntario = voluntarios.find(v => v.id === voluntarioId);
    onValueChange(voluntarioId, voluntario);
    setOpen(false);
  };

  const handleSearch = (termo: string) => {
    setSearchTerm(termo);
    if (termo.length >= 2 || termo === "") {
      loadVoluntarios(termo);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div className="text-left">
                {selectedVoluntario ? (
                  <div>
                    <div className="font-medium">{selectedVoluntario.display_name}</div>
                    {showFullName && selectedVoluntario.full_name !== selectedVoluntario.display_name && (
                      <div className="text-xs text-gray-500">{selectedVoluntario.full_name}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">{placeholder}</span>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar voluntário..." 
              value={searchTerm}
              onValueChange={handleSearch}
            />
            <CommandEmpty>
              {loading ? "Carregando..." : "Nenhum voluntário encontrado."}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {voluntarios.map((voluntario) => (
                <CommandItem
                  key={voluntario.id}
                  value={voluntario.id}
                  onSelect={() => handleSelect(voluntario.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === voluntario.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{voluntario.display_name}</div>
                      {showFullName && voluntario.full_name !== voluntario.display_name && (
                        <div className="text-xs text-gray-500">{voluntario.full_name}</div>
                      )}
                      {voluntario.nickname && (
                        <div className="text-xs text-blue-600">
                          Apelido: {voluntario.nickname}
                        </div>
                      )}
                    </div>
                  </div>
                  {voluntario.email && (
                    <div className="text-xs text-gray-400">
                      {voluntario.email}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VoluntarioSelector;