package com.wangziyang.mes.basedata.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpProcess;
import com.wangziyang.mes.basedata.mapper.SpProcessMapper;
import com.wangziyang.mes.basedata.service.ISpProcessService;
import com.wangziyang.mes.common.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("processService")
public class SpProcessServiceImpl extends ServiceImpl<SpProcessMapper, SpProcess> implements ISpProcessService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePhysicalById(Long id) {
        // 物理删除工序主表记录，彻底移除数据
        baseMapper.deletePhysicalById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<SpProcess> addProcess(SpProcess record) {
        // 1. 自动生成工序编号：前缀GX + 6位流水号（查全表，含软删除记录，避免编号碰撞）
        String maxCode = baseMapper.selectMaxProcessCode();
        String newCode;
        if (StrUtil.isBlank(maxCode)) {
            newCode = "GX000001";
        } else {
            String numPart = maxCode.substring(2);
            int nextNum = Integer.parseInt(numPart) + 1;
            newCode = "GX" + String.format("%06d", nextNum);
        }

        // 2. 校验工序编码唯一性（双重保险）
        QueryWrapper<SpProcess> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("process_code", newCode);
        if (count(checkWrapper) > 0) {
            return Result.failure("工序编码已存在，请重试");
        }

        // 3. 数据落库
        record.setProcessCode(newCode);
        record.setIsDeleted(0);
        save(record);
        return Result.success(record);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteProcess(Long id) {
        // 校验下游业务引用：产品BOM / 工艺详情
        long bomRef = baseMapper.countBomNodeRef(id);
        long detailRef = baseMapper.countDetailRef(id);
        if (bomRef > 0 || detailRef > 0) {
            return Result.failure("删除失败：该工序已被产品BOM或工艺详情引用，无法删除");
        }
        // TODO: 工艺路线模块开发完成后，加回 countRouteRef 校验

        // 无引用，执行物理删除，彻底释放编号
        baseMapper.deletePhysicalById(id);
        return Result.success();
    }
}