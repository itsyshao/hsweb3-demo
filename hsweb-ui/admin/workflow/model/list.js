importResource("/admin/css/common.css");

importMiniui(function () {
    mini.parse();
    require(["miniui-tools", "request", "message"], function (tools, request, message) {
        var grid = window.grid = mini.get("datagrid");
        tools.initGrid(grid);
        grid.setUrl(API_BASE_PATH + "workflow/model/");

        function search() {
            tools.searchGrid("#search-box", grid);
        }

        $(".search-button").click(search);
        tools.bindOnEnter("#search-box", search);
        $(".add-button").click(function () {
            mini.get('add-model').show()
        });

        $(".create-model-button").unbind("click").on("click", function () {
            var data = tools.getFormData("#addModelForm", true);
            if (data) {
                var loading = message.loading("提交中...");
                request.post("workflow/model/", data, function (response) {
                    loading.hide();
                    if (response.status === 201 || response.status === 200) {
                        new mini.Form("#addModelForm").clear();
                        mini.get("add-model").hide();
                        edit(response.result.id);
                    } else {
                        message.showTips("创建失败:" + response.message);
                    }
                })
            }
        })
        search();
        grid.getColumn("action").renderer = function (e) {
            var row = e.record;
            var html = [
                tools.createActionButton("编辑", "icon-edit", function () {
                    edit(row.id);
                })
            ];
            html.push(
                tools.createActionButton("发布", "icon-ok", function () {
                    message.confirm("确认发布此模型?", function () {
                        grid.loading("发布中...");
                        request['post']("workflow/model/" + row.id + "/deploy",{}, function (response) {
                            grid.reload();
                            if (response.status === 200) {
                                message.showTips("发布成功");
                            } else {
                                message.showTips("发布失败:" + response.message);
                            }
                        });
                    })
                })
            );
            html.push(
                tools.createActionButton("删除", "icon-remove", function () {
                    message.confirm("确认删除?", function () {
                        grid.loading("删除中...");
                        request['delete']("workflow/model/" + row.id, function (response) {
                            if (response.status === 200) {
                                grid.reload();
                            } else {
                                message.showTips("删除失败:" + response.message);
                            }
                        });
                    })
                })
            )
            return html.join("");
        }

        function edit(id) {
            tools.openWindow("workflow/modeler.html?modelId=" + id, "编辑模型", "80%", "80%", function (e) {
                grid.reload();
            })
        }

    });


});
