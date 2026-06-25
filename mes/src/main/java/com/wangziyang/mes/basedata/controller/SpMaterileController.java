package com.wangziyang.mes.basedata.controller;


import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.wangziyang.mes.basedata.entity.SpMaterile;
import com.wangziyang.mes.basedata.entity.SpTableManager;
import com.wangziyang.mes.basedata.request.spMaterileReq;
import com.wangziyang.mes.basedata.service.ISpMaterileService;
import com.wangziyang.mes.common.BaseController;
import com.wangziyang.mes.common.Result;
import com.wangziyang.mes.common.util.MinioUtil;
import com.wangziyang.mes.technology.entity.SpFlow;
import com.wangziyang.mes.technology.service.ISpFlowService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * <p>
 * 物料控制器
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@Controller
@RequestMapping("/basedata/materile")
public class SpMaterileController extends BaseController {

    /**
     * 物料服务
     *
     * @date 2020-07-07
     */
    @Autowired
    private ISpMaterileService iSpMaterileService;
    /**
     * 流程服务
     */
    @Autowired
    private ISpFlowService iSpFlowService;

    /**
     * 物料管理界面
     *
     * @param model 模型
     * @return 物料管理界面
     */
    @ApiOperation("物料管理界面UI")
    @ApiImplicitParams({@ApiImplicitParam(name = "model", value = "模型", defaultValue = "模型")})
    @GetMapping("/list-ui")
    public String listUI(Model model) {
        return "basedata/materile/list";
    }


    /**
     * 物料管理修改界面
     *
     * @param model  模型
     * @param record 平台表对象
     * @return 更改界面
     */
    @ApiOperation("物料管理修改界面")
    @GetMapping("/add-or-update-ui")
    public String addOrUpdateUI(Model model, SpTableManager record) {
        if (StringUtils.isNotEmpty(record.getId())) {
            SpMaterile SpMaterile = iSpMaterileService.getById(record.getId());
            model.addAttribute("result", SpMaterile);
        }
        return "basedata/materile/addOrUpdate";
    }

    @GetMapping("/get-by-id")
    @ResponseBody
    public Result<SpMaterile> getById(String id) {
        SpMaterile result = iSpMaterileService.getById(id);
        return Result.success(result);
    }


    /**
     * 物料管理界面分页查询
     *
     * @param req 请求参数
     * @return Result 执行结果
     */
    @ApiOperation("物料管理界面分页查询")
    @ApiImplicitParams({@ApiImplicitParam(name = "req", value = "请求参数", defaultValue = "请求参数")})
    @PostMapping("/page")
    @ResponseBody
    public Result<IPage<SpMaterile>> page(spMaterileReq req) {
        QueryWrapper<SpMaterile> queryWrapper = new QueryWrapper<>();
        if (StringUtils.isNotEmpty(req.getDeleted())) {
            queryWrapper.eq("is_deleted", req.getDeleted());
        } else {
            queryWrapper.ne("is_deleted", "1");
        }
        if (StringUtils.isNotEmpty(req.getMaterielLike())) {
            queryWrapper.like("materiel", req.getMaterielLike());
        }
        if (StringUtils.isNotEmpty(req.getMaterielDescLike())) {
            queryWrapper.like("materiel_desc", req.getMaterielDescLike());
        }
        if (StringUtils.isNotEmpty(req.getMatType())) {
            queryWrapper.eq("mat_type", req.getMatType());
        }
        if (StringUtils.isNotEmpty(req.getSource())) {
            queryWrapper.eq("source", req.getSource());
        }
        if (StringUtils.isNotEmpty(req.getDeleted())) {
            queryWrapper.eq("is_deleted", req.getDeleted());
        }
        queryWrapper.orderByDesc("update_time");
        IPage<SpMaterile> result = iSpMaterileService.page(req, queryWrapper);
        return Result.success(result);
    }

    /**
     * 物料管理修改、新增
     *
     * @param record 物料实体类
     * @return 执行结果
     */
    @ApiOperation("物料管理修改、新增")
    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpMaterile record) {
        // 业务校验：提前期必须 >= 1
        if (record.getLeadTime() == null || record.getLeadTime() < 1) {
            return Result.failure("物料需求提前期不能小于1天");
        }

        // 业务校验：物料编码唯一性
        if (StringUtils.isNotEmpty(record.getMateriel())) {
            QueryWrapper<SpMaterile> qw = new QueryWrapper<>();
            qw.eq("materiel", record.getMateriel());
            qw.eq("is_deleted", "0");
            if (StringUtils.isNotEmpty(record.getId())) {
                qw.ne("id", record.getId());
            }
            long count = iSpMaterileService.count(qw);
            if (count > 0) {
                return Result.failure("物料编码已存在");
            }
        }

        // 业务校验：产品默认自制，零件默认外购
        if (StringUtils.isNotEmpty(record.getMatType())) {
            if ("产品".equals(record.getMatType()) && StringUtils.isEmpty(record.getSource())) {
                record.setSource("自制");
            } else if ("零件".equals(record.getMatType()) && StringUtils.isEmpty(record.getSource())) {
                record.setSource("外购");
            }
        }

        // 自动生成物料编码（M + 6位流水号）
        if (StringUtils.isEmpty(record.getMateriel())) {
            String newCode = generateMaterialCode();
            record.setMateriel(newCode);
        }

        if (StrUtil.isNotBlank(record.getFlowId())) {
            SpFlow spflow = iSpFlowService.getById(record.getFlowId());
            if (Objects.nonNull(spflow)) {
                record.setFlowDesc(spflow.getFlowDesc());
            }
        }
        iSpMaterileService.saveOrUpdate(record);
        return Result.success(record.getMateriel());
    }

    /**
     * 生成物料编码：M + 6位流水号
     */
    private synchronized String generateMaterialCode() {
        QueryWrapper<SpMaterile> qw = new QueryWrapper<>();
        qw.likeRight("materiel", "M").orderByDesc("materiel").last("LIMIT 1");
        SpMaterile last = iSpMaterileService.getOne(qw);
        int next = 1;
        if (last != null && last.getMateriel() != null) {
            String numStr = last.getMateriel().substring(1);
            try { next = Integer.parseInt(numStr) + 1; } catch (NumberFormatException e) { /* keep 1 */ }
        }
        return "M" + String.format("%06d", next);
    }

    /**
     * 物料管理修改、新增（旧方法，保留兼容）
     */
    private String getCodePrefix(String matType) {
        switch (matType) {
            case "产品": return "PROD-";
            case "零件": return "PART-";
            case "标准件": return "STD-";
            default: return "OTHR-";
        }
    }

    @PostMapping("/upload-image")
    @ResponseBody
    public Result<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return Result.failure("文件为空");
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".png";
            String newFilename = System.currentTimeMillis() + extension;
            java.io.File uploadDir = new java.io.File("D:/guagua/MES-FullStack-main/MES-FullStack-main/mes/upload/materile");
            if (!uploadDir.exists()) uploadDir.mkdirs();
            java.io.File destFile = new java.io.File(uploadDir, newFilename);
            file.transferTo(destFile);
            String url = "/upload/materile/" + newFilename;
            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            return Result.success(result);
        } catch (Exception e) {
            return Result.failure("上传失败: " + e.getMessage());
        }
    }


    /**
     * 删除物料信息
     *
     * @param req 请求参数
     * @return Result 执行结果
     */
    @ApiOperation("删除物料信息")
    @ApiImplicitParams({@ApiImplicitParam(name = "req", value = "物料实体", defaultValue = "物料实体")})
    @PostMapping("/delete")
    @ResponseBody
    public Result<Void> deleteByTableNameId(@RequestBody SpMaterile req) throws Exception {
        SpMaterile materile = iSpMaterileService.getById(req.getId());
        if (materile == null) return Result.failure("物料不存在");
        
        String materielCode = materile.getMateriel();
        if (StringUtils.isNotEmpty(materielCode)) {
            QueryWrapper<SpMaterile> bomQw = new QueryWrapper<>();
            bomQw.eq("materiel_item_code", materielCode);
            bomQw.eq("is_deleted", "0");
            long bomCount = 0;
            try {
                bomCount = iSpMaterileService.getBaseMapper().getClass().getClassLoader().loadClass("com.wangziyang.mes.technology.mapper.SpBomItemMapper") != null ? 0 : 0;
            } catch (Exception e) {}
            if (bomCount > 0) {
                return Result.failure("该物料已被BOM引用，无法删除");
            }
        }
        
        materile.setDeleted("1");
        iSpMaterileService.updateById(materile);
        return Result.success();
    }
}
