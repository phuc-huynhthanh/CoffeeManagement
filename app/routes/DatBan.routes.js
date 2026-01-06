import express from 'express';
const router = express.Router();
import DatBanController from '../controllers/DatBan.controller.js';

router.post('/them', DatBanController.them);
router.get('/laytatca', DatBanController.layTatCa);
router.get('/lay/:id', DatBanController.layTheoId);
router.put('/capnhat-trangthai/:id', DatBanController.capNhatTrangThai);
router.put('/huy/:id', DatBanController.huy);
router.delete('/xoa/:id', DatBanController.xoa);
router.post('/capnhat-quahan', DatBanController.capNhatQuaHan);
router.get('/dang-hoat-dong', DatBanController.layDangHoatDong);

export default router;
