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
import {Toast} from "primereact/toast";
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
                toast.current.show({severity: "warn", detail: "Ação cancelada."});
            }}
            className="p-button-text"
        />
        <Button
            label="Adicionar"
            icon="pi pi-check"
            onClick={async () => {
                const newTask = {
                    title_task: taskName,
                    description_task: taskDescription,
                    status_task: taskStatus,
                };

                try {
                    const createdTask = await TaskService.postTask(newTask); // Espera a criação da tarefa
                    console.log('Nova tarefa criada:', createdTask); // Verifica o objeto retornado
                    setTasks((prevTasks) => [...prevTasks, createdTask]); // Atualiza a lista de tarefas com a nova tarefa
                    toast.current.show({severity: "success", detail: "Tarefa adicionada com sucesso!"});
                    setVisible(false); // Fecha o Dialog
                } catch (error) {
                    toast.current.show({severity: "error", detail: "Erro ao adicionar a tarefa"});
                }
            }}
            autoFocus
        />
    </div>
);

// Componente Footer do Dialog Editar
const FooterContentEdit = ({onClose, taskName, taskDescription, taskId, taskStatus, setTasks, setVisible, toast}) => (
    <div>
        <Button
            label="Não"
            icon="pi pi-times"
            onClick={() => {
                onClose();
                toast.current.show({severity: "warn", detail: "Ação cancelada."});
            }}
            className="p-button-text"
        />
        <Button
            label="Atualizar"
            icon="pi pi-check"
            onClick={async () => {
                // Passando também o status para a atualização da tarefa
                try {
                    await TaskService.handleUpdateTask(taskId, taskName, taskDescription, taskStatus, setTasks, setVisible);
                    toast.current.show({severity: "success", detail: "Tarefa atualizada com sucesso!"});
                } catch (error) {
                    toast.current.show({severity: "error", detail: "Erro ao atualizar a tarefa"});
                }
            }}
            autoFocus
        />
    </div>
);

export default function MyApp() {
    const [visibleAdd, setVisibleAdd] = useState(false);
    const [visibleEdit, setVisibleEdit] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const toast = useRef(null);

    // Buscar tarefas ao montar o componente
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasks = await TaskService.getTasks();
                setTasks(tasks.registros); // Atualiza o estado com a lista de tarefas
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

        let severity = "secondary";
        const status = rowData.status_task.toUpperCase();

        if (status === "PENDING") {
            severity = "warning";
        } else if (status === "COMPLETED") {
            severity = "success";
        } else if (status === "IN_PROGRESS") {
            severity = "info";
        } else if (status === "CANCELED") {
            severity = "danger";
        }

        return <Badge value={rowData.status_task} severity={severity}/>;
    };

    const handleEdit = async (task) => {
        setTaskId(task.id_task);
        setTaskName(task.title_task);
        setTaskDescription(task.description_task);
        setTaskStatus(task.status_task);
        setVisibleEdit(true);
    };

    const handleDelete = async (taskId) => {
        try {
            // Chama o serviço de delete
            await TaskService.deleteTask(taskId);

            // Atualiza o estado para remover a tarefa
            setTasks(tasks.filter((task) => task.id_task !== taskId));

            // Exibe o Toast de sucesso
            toast.current.show({severity: 'success', detail: 'Tarefa excluída com sucesso!'});
        } catch (error) {
            toast.current.show({severity: 'error', detail: 'Erro ao excluir tarefa'});
        }
    };

    return (
        <div className="p-4">
            <div className="card flex justify-content-center">
                <Button label="Adicionar nova tarefa" icon="pi pi-plus" onClick={() => setVisibleAdd(true)}/>
            </div>

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
                    toast={toast}
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

            <Dialog
                header="Editar tarefa"
                visible={visibleEdit}
                onHide={() => setVisibleEdit(false)}
                footer={<FooterContentEdit
                    onClose={() => setVisibleEdit(false)}
                    taskId={taskId}
                    taskName={taskName}
                    taskDescription={taskDescription}
                    taskStatus={taskStatus}
                    setTasks={setTasks}
                    setVisible={setVisibleEdit}
                    toast={toast}
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
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                onClick={() => handleDelete(rowData.id_task)}
                            />
                        </div>
                    )}
                    style={{width: "15%"}}
                />
            </DataTable>

            <Toast ref={toast}/>
        </div>
    );
}
