import RestService from "./RestService";

class TaskService extends RestService {
    async getTasks() {
        return this._get("/tasks");
    }

    async getTaskById(taskId) {
        return this._getById("/tasks/" + taskId, false);
    }

    async postTask(task) {
        return this._post("/tasks", task, false);
    }

    async putTask(taskId, task) {
        return this._put("/tasks", taskId, task, false);
    }

    async deleteTask(taskId) {
        return this._delete("/tasks", taskId, false);
    }
}

export default TaskService;
