package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wangziyang.mes.basedata.entity.SpPartsCategory;
import com.wangziyang.mes.basedata.service.ISpPartsCategoryService;
import com.wangziyang.mes.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 物料分类控制器
 *
 * @author WangZiYang
 */
@RestController
@RequestMapping("/basedata/parts/category")
public class SpPartsCategoryController {

    @Autowired
    private ISpPartsCategoryService spPartsCategoryService;

    /**
     * 分类树：返回全部分类，前端组装树结构
     */
    @GetMapping("/tree")
    @ResponseBody
    public Result tree() {
        QueryWrapper<SpPartsCategory> qw = new QueryWrapper<>();
        qw.orderByAsc("parent_id").orderByAsc("sort");
        List<SpPartsCategory> list = spPartsCategoryService.list(qw);
        return Result.success(list);
    }

    /**
     * 新增分类
     */
    @PostMapping("/add")
    @ResponseBody
    public Result add(@RequestBody SpPartsCategory record) {
        spPartsCategoryService.save(record);
        return Result.success(record.getId());
    }

    /**
     * 编辑分类
     */
    @PostMapping("/update")
    @ResponseBody
    public Result update(@RequestBody SpPartsCategory record) {
        spPartsCategoryService.updateById(record);
        return Result.success();
    }

    /**
     * 删除分类
     */
    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody SpPartsCategory record) {
        spPartsCategoryService.removeById(record.getId());
        return Result.success();
    }
}