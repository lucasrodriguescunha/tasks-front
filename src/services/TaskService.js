import axios from "axios";

class TaskService {
    constructor() {
        this.api = axios.create({
            baseURL: "http://localhost:8080", // Ajuste conforme a URL da sua API
        });
    }

    async getTasks() {
        try {
            const response = await this.api.get("/tasks");
            return response.data; // Retorna todos os dados, incluindo 'registros'
        } catch (error) {
            console.error("Erro ao buscar tarefas", error);
            throw error;
        }
    }

    async postTask(task) {
        try {
            const response = await this.api.post("/tasks", task);
            return response.data; // Retorna a tarefa criada com o ID
        } catch (error) {
            console.error("Erro ao criar tarefa", error);
            throw error;
        }
    }

    async putTask(taskId, task) {
        try {
            const response = await this.api.put(`/tasks/update/${taskId}`, task);
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar tarefa", error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            await this.api.delete(`/tasks/delete/${taskId}`);
        } catch (error) {
            console.error("Erro ao deletar tarefa", error);
            throw error;
        }
    }

    // Função para atualizar uma tarefa
    async handleUpdateTask(taskId, taskName, taskDescription, taskStatus, setTasks, setVisible) {
        const updatedTask = {
            title_task: taskName,
            description_task: taskDescription,
            status_task: taskStatus, // Incluindo o status
        };

        try {
            // Chama a API para atualizar a tarefa
            const response = await this.putTask(taskId, updatedTask);

            // Atualiza a lista de tarefas no estado
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id_task === taskId ? {...task, ...response} : task
                )
            );

            setVisible(false); // Fecha o modal
        } catch (error) {
            console.error("Erro ao atualizar a tarefa", error);
        }
    }

    async findTaskById(taskId) {
        try {
            const response = await this.api.get(`/tasks/find/${taskId}`);
            return response.data; // Retorna a tarefa encontrada
        } catch (error) {
            console.error("Erro ao buscar tarefa por ID", error);
            throw error;
        }
    }
}

export default new TaskService();