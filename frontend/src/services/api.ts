import api from "../api/client";

export async function listCertificates() {
    const { data } = await api.get("/issuer/certificates");
    return data;
}

export async function getCertificate(id: string) {
    const items = await listCertificates();
    return items.find((c: any) => c.id === id || c.certificateId === id);
}

export async function verifyCertificate(id: string) {
    const { data } = await api.get(`/verify/${id}`);
    return data;
}

export async function uploadAndVerify(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export async function listStudentCertificates() {
    const { data } = await api.get("/students/me/certificates");
    return data;
}

export async function claimCertificate(token: string) {
    const { data } = await api.post("/students/claim", { token });
    return data;
}

export async function getStudentCredential(id: string) {
    const { data } = await api.get(`/students/me/certificates/${id}/credential`);
    return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
    return data;
}

export async function revokeCertificate(id: string) {
    const { data } = await api.post(`/issuer/certificates/${id}/revoke`);
    return data;
}
