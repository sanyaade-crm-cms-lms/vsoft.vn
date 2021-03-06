//theo trạng thái - số lượng dự án theo đơn vị
var myApp = angular.module('xMoney');
myApp.directive('reportProjectByDepartment', function (xService, ngDialog) {
    return {
        restrict: 'E',
        scope: true,
        link: function ($scope, element, attrs) {

            var rootData = "Data.TasksDS.Project";
            var chartCategoryField = "DepartmentName";

            $scope.pageTitle = "";
            $scope.diagramReady = false;
            $scope.config = {};

            $scope.showReportTableDetail = false;
            $scope.showReportTableDetail = (attrs.showFilter);
            $scope.searchQuery = {};
            $scope.searchConfigSelect = [
                /*{
                 "caption": "Đơn vị,",
                 "model": "Department",
                 "source": {
                 "RequestAction": "SearchGroup",
                 "RequestClass": "BPM",
                 "GroupType": 1,
                 "ConditionFields": "GroupType",
                 "StructField": true
                 },
                 display: ["GroupId", "GroupName"]
                 }*/
            ];


            var getSelectData = function (model, callback) {
                angular.forEach($scope.searchConfigSelect, function (v, k) {
                    if (v.model == model) {
                        $scope.pageTitle = v.caption;
                        xService.requestServer(v.source, function (err, resp) {
                            if (err) {
                                callback(err, null);
                            } else {
                                var opts = [];
                                angular.forEach(resp.datasource, function (vv) {
                                    var obj = {};
                                    obj['value'] = vv[v.display[0]];
                                    obj['caption'] = vv[v.display[1]];
                                    obj['model'] = v.model;
                                    opts.push(obj);
                                });
                                callback(null, opts);
                            }
                        });
                    }
                })

            };




            var generateQuery = function (callback) {
                var searchParams = {},
                    conditionField = [];

                angular.forEach($scope.searchQuery, function (v, k) {
                    if (angular.isObject(v)) {
                        var arr = [];
                        angular.forEach(v, function (value, key) {
                            if (value == true) {
                                arr.push(key);
                            }
                        });
                        var arrStr = arr.join(';');

                        searchParams[k] = arrStr;
                    } else {
                        searchParams[k] = v;
                    }
                    conditionField.push(k);
                });
                angular.forEach(conditionField, function (field) {
                    angular.forEach($scope.searchConfigSelect, function (config) {
                        if (config.model == field && config.source.StructField) {
                            searchParams[config.model + 'ColumnType'] = 0;
                            conditionField.push(config.model + 'ColumnType');
                        }
                    })
                });
                conditionField = conditionField.join(';');

                callback(searchParams, conditionField);
            };


            function getParams() {
                var params = {
                    DynamicFields: 'DepartmentName',
                    RequestAction: 'SearchProject',
                    RequestClass: 'Tasks',
                    StaticFields: 'Name;Id',
                    StructFields: 'Department'
                };
                return params;
            }


            $scope.chartConfig = {
                options: {
                    title: { text: 'Số lượng dự án theo đơn vị' }
                }
            };

            $scope.refreshChart = function (params) {
                if (params == null) {
                    params = getParams();
                }
                var result = null;

                xService.requestServerNative(params, function (err, data) {
                    var root = rootData.split('.');

                    for (var i = 0; i < root.length; i++) {
                        if (data[root[i]] != undefined) {
                            data = data[root[i]];
                        }
                    }

                    if (data.length > 0) {
                        result = data;
                    } else {
                        result = [data];
                    }

                    if (result != null) {
                        $scope.chartSeries = [];
                        $scope.chartCategories = [];
                        var projectByStatus = {};
                        for (var i = 0; i < result.length; i++) {
                            if (typeof result[i][chartCategoryField] != "undefined" && $scope.chartCategories.indexOf(result[i][chartCategoryField]) < 0) {
                                $scope.chartCategories.push(result[i][chartCategoryField]);
                            }
                            var key = result[i][chartCategoryField];
                            if (projectByStatus[key] != null && projectByStatus[key] != undefined) {
                                projectByStatus[key] += 1;
                            } else {
                                projectByStatus[key] = 1;
                            }
                        }

                        $scope.chartSeries = [
                            { name: 'Số lượng dự án', data: [] }
                        ];
                        for (var i = 0; i < $scope.chartCategories.length; i++) {
                            $scope.chartSeries[0].data.push(projectByStatus[$scope.chartCategories[i]]);
                        }

                        $scope.projectByStatus = projectByStatus;

                        if ($scope.chartCategories.length > 0) {
                            $scope.heighChart = $scope.chartCategories.length * 115;
                            /*tạo config cho biểu đồ*/
                            $scope.chartConfig = {
                                options: {
                                    chart: {
                                        type: ($scope.chartCategories.length) > 5 ? 'bar' : 'column',
                                        height: ($scope.chartCategories.length) > 5 ? $scope.heighChart : 400
                                    },
                                    colors: ['#2F7ED8'],
                                    title: { text: 'Số lượng dự án theo đơn vị' },
                                    xAxis: { categories: $scope.chartCategories, title: { text: null } },
                                    yAxis: { min: 0, title: { text: '', align: 'high' }, labels: { overflow: 'justify' } },
                                    plotOptions: {
                                        column: {
                                            dataLabels: { enabled: true }
                                        },
                                        series: {
                                            pointWidth: 35,
                                            cursor: 'pointer',
                                            point: {
                                                events: {

                                                }
                                            }
                                        }
                                    },
                                    legend: { enabled: false },
                                    credits: { enabled: false }
                                },
                                series: $scope.chartSeries
                            };
                            $scope.reportNull = false;

                        } else {
                            $scope.reportNull = true;

                        }

                    } else {
                        $scope.reportNull = true;
                    }

                    $scope.diagramReady = true;
                });
            };

            $scope.refreshChart();
            $scope.$watch('startDate', function () {
                    console.log('startDate');
                }
            );
            /*sự kiện tìm kiếm*/
            $scope.onSearch = function () {
                var params = getParams();

                var conditionFields = '';

                if ($scope.config.startDate != null && $scope.config.startDate != undefined && $scope.config.startDate != '') {
                    params.StartDateStartValue = moment($scope.config.startDate).format("YYYY-MM-DD");
                    conditionFields += "StartDate;";
                }

                if ($scope.config.endDate != null && $scope.config.endDate != undefined && $scope.config.endDate != '') {
                    params.StartDateEndValue = moment($scope.config.endDate).format("YYYY-MM-DD");
                    conditionFields += "EndDate;";
                }

                if (params.StartDateEndValue != undefined && params.StartDateStartValue != undefined) {
                    conditionFields += "StartDate;";
                    params.StartDateColumnType = 3;
                } else {
                    delete params.StartDateStartValue;
                    delete params.StartDateEndValue;
                }


                /*if (conditionFields != '') {
                 params["ConditionFields"] = conditionFields;
                 }*/

                generateQuery(function (data, conditionalField) {

                    angular.extend(params, data);
                    conditionFields += conditionalField;
                    params["ConditionFields"] = conditionFields;


                    $scope.refreshChart(params);
                });
            };


            $scope.openModalSearch = function (model) {
                modalSearch = ngDialog.open(
                    {
                        template: './views/projects/diagrams/modal/projects-modal.html',
                        showClose: false,
                        scope: $scope
                    }
                );
                getSelectData(model, function (err, data) {
                    $scope.optionData = data;
                })
            }

            /*cập nhật biểu đồ*/
            $scope.updateChart = function () {
                var params = {
                    RequestAction: 'SummaryAllProjectsByTask',
                    RequestClass: 'Tasks'
                };

                xService.requestServerNative(params, function (err, data) {
                    toastr.pop('success', "Cập nhật thành công");
                });
            };
        },
        templateUrl: 'views/projects/diagrams/report-project-by-department.html'
    };
});
