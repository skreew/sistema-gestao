import React from 'react';
import {
  Truck,
  ShoppingCart,
  Trash2,
  Pencil,
  LogOut,
  Search,
  LayoutDashboard,
  FileText,
  Settings,
  DollarSign,
  Calendar,
  Box,
  Menu,
  X,
  BarChart,
  CheckCircle,
  Circle,
  Plus,
  Minus,
  BookOpen,
  Users,
  Store,
  Eye,
  AlertTriangle, // Adicionado
  Check, // Adicionado
  Eraser, // Adicionado
} from 'lucide-react';

const Icon = ({ children, ...props }) => (
  <span className="icon" {...props}>
    {children}
  </span>
);

export const IconeCaminhao = (props) => (
  <Icon {...props}>
    <Truck size={24} />
  </Icon>
);
export const IconeCarrinho = (props) => (
  <Icon {...props}>
    <ShoppingCart size={24} />
  </Icon>
);
export const IconeLixeira = (props) => (
  <Icon {...props}>
    <Trash2 size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeEditar = (props) => (
  <Icon {...props}>
    <Pencil size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeLogout = (props) => (
  <Icon {...props}>
    <LogOut size={24} />
  </Icon>
);
export const IconeBusca = (props) => (
  <Icon {...props}>
    <Search size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeCatalogo = (props) => (
  <Icon {...props}>
    <BookOpen size={24} />
  </Icon>
);
export const IconeDashboard = (props) => (
  <Icon {...props}>
    <LayoutDashboard size={24} />
  </Icon>
);
export const IconeFichaTecnica = (props) => (
  <Icon {...props}>
    <FileText size={24} />
  </Icon>
);
export const IconeConfiguracoes = (props) => (
  <Icon {...props}>
    <Settings size={24} />
  </Icon>
);
export const IconeCheck = (props) => (
  <Icon {...props}>
    <Check size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeCirculo = (props) => (
  <Icon {...props}>
    <Circle size={24} />
  </Icon>
);
export const IconeMais = (props) => (
  <Icon {...props}>
    <Plus size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeRemover = (props) => (
  <Icon {...props}>
    <Minus size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeAnalises = (props) => (
  <Icon {...props}>
    <BarChart size={24} />
  </Icon>
);
export const IconeGrafico = (props) => (
  <Icon {...props}>
    <BarChart size={24} />
  </Icon>
);
export const IconeDinheiro = (props) => (
  <Icon {...props}>
    <DollarSign size={24} />
  </Icon>
);
export const IconeCalendario = (props) => (
  <Icon {...props}>
    <Calendar size={24} />
  </Icon>
);
export const IconeCaixa = (props) => (
  <Icon {...props}>
    <Box size={24} />
  </Icon>
);
export const IconeMenu = (props) => (
  <Icon {...props}>
    <Menu size={24} />
  </Icon>
);
export const IconeFechar = (props) => (
  <Icon {...props}>
    <X size={24} />
  </Icon>
);
export const IconeUsers = (props) => (
  <Icon {...props}>
    <Users size={24} />
  </Icon>
);
export const IconeVendas = (props) => (
  <Icon {...props}>
    <Store size={24} />
  </Icon>
);
export const IconeOlho = (props) => (
  <Icon {...props}>
    <Eye size={20} />
  </Icon>
); // Tamanho ajustado
export const IconeAlerta = (props) => (
  <Icon {...props}>
    <AlertTriangle size={18} />
  </Icon>
);
export const IconeLimpar = (props) => (
  <Icon {...props}>
    <Eraser size={20} />
  </Icon>
);
