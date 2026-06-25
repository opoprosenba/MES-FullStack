package com.wangziyang.mes.basedata.request;

import com.wangziyang.mes.common.BasePageReq;
/**
 * 物料分页对象
 * @author wangziyang
 * @since 2020/04/01
 */
public class spMaterileReq  extends BasePageReq {
    /**
     *模糊查询物料编号
     */
    private String materielLike;
    /**
     *模糊查询物料描述
     */
    private String materielDescLike;

    private String matType;

    private String source;

    private String deleted;

    /**
     * 获取 模糊查询物料编号
     *
     * @return materielLike 模糊查询物料编号
     */
    public String getMaterielLike() {
        return this.materielLike;
    }

    /**
     * 设置 模糊查询物料编号
     *
     * @param materielLike 模糊查询物料编号
     */
    public void setMaterielLike(String materielLike) {
        this.materielLike = materielLike;
    }

    /**
     * 获取 模糊查询物料描述
     *
     * @return materielDescLike 模糊查询物料描述
     */
    public String getMaterielDescLike() {
        return this.materielDescLike;
    }

    /**
     * 设置 模糊查询物料描述
     *
     * @param materielDescLike 模糊查询物料描述
     */
    public void setMaterielDescLike(String materielDescLike) {
        this.materielDescLike = materielDescLike;
    }

    public String getMatType() { return matType; }
    public void setMatType(String matType) { this.matType = matType; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }
}
