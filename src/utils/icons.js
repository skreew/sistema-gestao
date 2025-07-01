import React from 'react';
// Add BookOpen and Store to the import statement
import { Truck, ShoppingCart, Trash2, Pencil, LogOut, Search, LayoutDashboard, FileText, Settings, DollarSign, Calendar, Box, Package, Menu, X, BarChart, CheckCircle, Circle, Plus, Minus, BookOpen, Store } from 'lucide-react';

const Icon = ({ children, ...props }) => <span className="icon" {...props}>{children}</span>;

export const IconeCaminhao = (props) => <Icon {...props}><Truck size={24} /></Icon>;
export const IconeCarrinho = (props) => <Icon {...props}><ShoppingCart size={24} /></Icon>;
export const IconeLixeira = (props) => <Icon {...props}><Trash2 size={24} /></Icon>;
export const IconeEditar = (props) => <Icon {...props}><Pencil size={24} /></Icon>;
export const IconeLogout = (props) => <Icon {...props}><LogOut size={24} /></Icon>;
export const IconeBusca = (props) => <Icon {...props}><Search size={24} /></Icon>;
export const IconeCatalogo = (props) => <Icon {...props}><BookOpen size={24} /></Icon>; // Correct: BookOpen is now imported
export const IconeDashboard = (props) => <Icon {...props}><LayoutDashboard size={24} /></Icon>;
export const IconeFichaTecnica = (props) => <Icon {...props}><FileText size={24} /></Icon>;
export const IconeConfiguracoes = (props) => <Icon {...props}><Settings size={24} /></Icon>;
export const IconeCheck = (props) => <Icon {...props}><CheckCircle size={24} /></Icon>;
export const IconeCirculo = (props) => <Icon {...props}><Circle size={24} /></Icon>;
export const IconeMais = (props) => <Icon {...props}><Plus size={24} /></Icon>;
export const IconeRemover = (props) => <Icon {...props}><Minus size={24} /></Icon>;
export const IconeAnalises = (props) => <Icon {...props}><BarChart size={24} /></Icon>;
export const IconeGrafico = (props) => <Icon {...props}><BarChart size={24} /></Icon>;
export const IconeDinheiro = (props) => <Icon {...props}><DollarSign size={24} /></Icon>;
export const IconeCalendario = (props) => <Icon {...props}><Calendar size={24} /></Icon>;
export const IconeCaixa = (props) => <Icon {...props}><Box size={24} /></Icon>;
export const IconeEstoque = (props) => <Icon {...props}><Package size={24} /></Icon>;
export const IconePdv = (props) => <Icon {...props}><Store size={24} /></Icon>; // Correct: Store is now imported
export const IconeMenu = (props) => <Icon {...props}><Menu size={24} /></Icon>;
export const IconeFechar = (props) => <Icon {...props}><X size={24} /></Icon>;