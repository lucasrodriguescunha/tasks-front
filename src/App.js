import React, {useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {Dialog} from "primereact/dialog";
import {Badge} from "primereact/badge";
import {InputTextarea} from "primereact/inputtextarea";
import {FloatLabel} from "primereact/floatlabel";
import TaskService from "./services/TaskService";
import RestService from "./services/RestService";
import {Toast} from "primereact/toast"; // Importa o Toast

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import {Dropdown} from "primereact/dropdown";

const statusOptions = [
    {label: "IN_PROGRESS", value: "IN_PROGRESS"},
    {label: "COMPLETED", value: "COMPLETED"},
    {label: "CANCELED", value: "CANCELED"}
];

// Componente Footer do Dialog Adicionar
const FooterContentAdd = ({
                              onClose,
                              taskName,
                              taskDescription,
                              setTasks,
                              taskStatus,
                              setTaskStatus,
                              setVisible,
                              toast
                          }) => (
    <div>
        <Button
            label="Não"
            icon="pi pi-times"
            onClick={() => {
                onClose();
                toast.current.show({severity: "warn", detail: "Ação cancelada."}); // Exibe o Toast de cancelamento
            }}
            className="p-button-text"
        />
        <Button
            label="Adicionar"
            icon="pi pi-check"
            onClick={() => {
                const newTaskId = new Date().getTime(); // Gerando um ID único
                TaskService.handleCreateTask(newTaskId, taskName, taskDescription, setTasks, setVisible);
                toast.current.show({severity: "success", detail: "Tarefa adicionada com sucesso!"});
            }}
            autoFocus
        />
    </div>
);

// Componente Footer do Dialog Editar
const FooterContentEdit = ({onClose, taskName, taskDescription, taskId, setTasks, setVisible, toast}) => (
    <div>
        <Button
            label="Não"
            icon="pi pi-times"
            onClick={() => {
                onClose();
                toast.current.show({severity: "warn", detail: "Ação cancelada."}); // Exibe o Toast de cancelamento
            }}
            className="p-button-text"
        />
        <Button
            label="Atualizar"
            icon="pi pi-check"
            onClick={() => {
                TaskService.handleUpdateTask(taskId, taskName, taskDescription, setTasks, setVisible);
                toast.current.show({severity: "success", detail: "Tarefa atualizada com sucesso!"});
            }}
            autoFocus
        />
    </div>
);

export default function MyApp() {
    const [visibleAdd, setVisibleAdd] = useState(false); // Estado para o Dialog Adicionar
    const [visibleEdit, setVisibleEdit] = useState(false); // Estado para o Dialog Editar
    const [taskName, setTaskName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskId, setTaskId] = useState(null); // Para armazenar o ID da tarefa no modo de edição

    const [taskStatus, setTaskStatus] = useState(null); // Estado para armazenar o status da tarefa

    const toast = useRef(null); // Referência ao Toast

    // Buscar tarefas ao montar o componente
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasks = await TaskService.getTasks();  // Ensure this matches your TaskService export
                console.log(tasks);
            } catch (error) {
                console.error('Erro ao buscar tarefas:', error);
            }
        };

        fetchTasks();
    }, []);

    // Define a cor do badge do status
    const statusBodyTemplate = (rowData) => {
        if (!rowData || !rowData.status_task) {
            return <Badge value="Sem status" severity="secondary"/>;
        }

        let severity = "secondary"; // Padrão (cinza)
        const status = rowData.status_task.toUpperCase(); // Garante compatibilidade com o enum

        if (status === "PENDING") {
            severity = "warning"; // Amarelo
        } else if (status === "COMPLETED") {
            severity = "success"; // Verde
        } else if (status === "IN_PROGRESS") {
            severity = "info"; // Azul
        } else if (status === "CANCELED") {
            severity = "danger"; // Vermelho
        }

        return <Badge value={rowData.status_task} severity={severity}/>;
    };

    const handleEdit = (task) => {
        setTaskId(task.id_task);
        setTaskName(task.title_task);
        setTaskDescription(task.description_task);
        setTaskStatus(task.status_task); // Seta o status da tarefa ao editar
        setVisibleEdit(true); // Abre o Dialog de Edição
    };

    const handleDelete = (taskId) => {
        setTasks(tasks.filter((task) => task.id_task !== taskId));
    };

    return (
        <div className="p-4">
            {/* Botão para adicionar nova tarefa */}
            <div className="card flex justify-content-center">
                <Button label="Adicionar nova tarefa" icon="pi pi-plus" onClick={() => setVisibleAdd(true)}/>
            </div>

            {/* Dialog Adicionar */}
            <Dialog
                header="Adicionar tarefa"
                visible={visibleAdd}
                onHide={() => setVisibleAdd(false)}
                footer={<FooterContentAdd
                    onClose={() => setVisibleAdd(false)}
                    taskName={taskName}
                    taskDescription={taskDescription}
                    setTasks={setTasks}
                    taskStatus={taskStatus}
                    setTaskStatus={setTaskStatus}
                    setVisible={setVisibleAdd}
                    toast={toast} // Passa o toast para o Footer
                />}
            >
                <div className="card flex justify-content-center flex-column p-4 gap-5">
                    <FloatLabel>
                        <InputText id="name" value={taskName} onChange={(e) => setTaskName(e.target.value)}/>
                        <label htmlFor="name">Nome</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputTextarea
                            id="description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={5}
                            cols={30}
                        />
                        <label htmlFor="description">Descrição</label>
                    </FloatLabel>
                </div>
            </Dialog>

            {/* Dialog Editar */}
            <Dialog
                header="Editar tarefa"
                visible={visibleEdit}
                onHide={() => setVisibleEdit(false)}
                footer={<FooterContentEdit
                    onClose={() => setVisibleEdit(false)}
                    taskName={taskName}
                    taskDescription={taskDescription}
                    taskId={taskId}
                    setTasks={setTasks}
                    setVisible={setVisibleEdit}
                    toast={toast} // Passa o toast para o Footer
                />}
            >
                <div className="card flex justify-content-center flex-column p-4 gap-5">
                    <FloatLabel>
                        <InputText id="name" value={taskName} onChange={(e) => setTaskName(e.target.value)}/>
                        <label htmlFor="name">Nome</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputTextarea
                            id="description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={5}
                            cols={30}
                        />
                        <label htmlFor="description">Descrição</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown id="status" value={taskStatus} options={statusOptions}
                                  onChange={(e) => setTaskStatus(e.value)}/>
                        <label htmlFor="status">Status</label>
                    </FloatLabel>
                </div>
            </Dialog>

            {/* Data Table */}
            <DataTable value={tasks} removableSort paginator rows={6} className="mt-4"
                       emptyMessage="Nenhuma tarefa disponível">
                <Column field="id_task" header="ID" sortable style={{width: "30%"}}/>
                <Column field="title_task" header="Nome" sortable style={{width: "30%"}}/>
                <Column field="description_task" header="Descrição" sortable style={{width: "40%"}}/>
                <Column field="status_task" header="Status" body={statusBodyTemplate} style={{width: "15%"}}/>
                <Column
                    body={(rowData) => (
                        <div className="flex gap-2 justify-end">
                            <Button icon="pi pi-pencil" severity="success" onClick={() => handleEdit(rowData)}/>
                            <Button icon="pi pi-trash" severity="danger" onClick={() => handleDelete(rowData.id_task)}/>
                        </div>
                    )}
                    style={{width: "15%"}}
                />
            </DataTable>

            <Toast ref={toast}/> {/* Coloca o Toast aqui */}
        </div>
    );
}
