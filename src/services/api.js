import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getStudents = async () => {
    const response = await axios.get(`${API_BASE_URL}/students`);
    return response.data;
};

export const addStudent = async (student) => {
    const response = await axios.post(`${API_BASE_URL}/students`, student);
    return response.data;
};

export const deleteStudent = async (id) => {
    await axios.delete(`${API_BASE_URL}/students/${id}`);
};