import * as tslib_1 from "tslib";
import * as React from "react";
import { MetaData } from "./global";
import { invalidview } from "./store";
function isPromiseModule(module) {
    return typeof module["then"] === "function";
}
function isPromiseView(moduleView) {
    return typeof moduleView["then"] === "function";
}
function getView(getModule, viewName) {
    var result = getModule();
    if (isPromiseModule(result)) {
        return result.then(function (module) { return module.views[viewName]; });
    }
    else {
        return result.views[viewName];
    }
}
export function loadModel(getModule) {
    var result = getModule();
    if (isPromiseModule(result)) {
        return result.then(function (module) { return module.model; });
    }
    else {
        return Promise.resolve(result.model);
    }
}
export function loadView(moduleGetter, moduleName, viewName, loadingComponent) {
    if (loadingComponent === void 0) { loadingComponent = null; }
    return (function (_super) {
        tslib_1.__extends(Loader, _super);
        function Loader() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                Component: null,
            };
            return _this;
        }
        Loader.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return nextState.Component !== this.state.Component;
        };
        Loader.prototype.componentWillMount = function () {
            var _this = this;
            var moduleViewResult = getView(moduleGetter[moduleName], viewName);
            if (isPromiseView(moduleViewResult)) {
                moduleViewResult.then(function (Component) {
                    _this.setState({
                        Component: Component,
                    });
                });
            }
            else {
                this.setState({
                    Component: moduleViewResult,
                });
            }
        };
        Loader.prototype.render = function () {
            var Component = this.state.Component;
            return Component ? React.createElement(Component, tslib_1.__assign({}, this.props)) : loadingComponent;
        };
        return Loader;
    }(React.Component));
}
export function exportView(ComponentView, model, viewName) {
    var Comp = ComponentView;
    if (MetaData.isBrowser) {
        return (function (_super) {
            tslib_1.__extends(Component, _super);
            function Component(props, context) {
                var _this = _super.call(this, props, context) || this;
                var state = MetaData.clientStore.getState();
                var namespace = model.namespace;
                _this.state = {
                    modelReady: !!state[namespace],
                };
                model(MetaData.clientStore).then(function () {
                    if (!_this.state.modelReady) {
                        _this.setState({ modelReady: true });
                    }
                });
                return _this;
            }
            Component.prototype.componentWillMount = function () {
                var _a;
                var currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (!currentViews[model.namespace]) {
                    currentViews[model.namespace] = (_a = {}, _a[viewName] = 1, _a);
                }
                else {
                    var views = currentViews[model.namespace];
                    if (!views[viewName]) {
                        views[viewName] = 1;
                    }
                    else {
                        views[viewName]++;
                    }
                }
                invalidview();
            };
            Component.prototype.componentWillUnmount = function () {
                var currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (currentViews[model.namespace] && currentViews[model.namespace][viewName]) {
                    currentViews[model.namespace][viewName]--;
                }
                invalidview();
            };
            Component.prototype.render = function () {
                return this.state.modelReady ? React.createElement(Comp, tslib_1.__assign({}, this.props)) : null;
            };
            return Component;
        }(React.PureComponent));
    }
    else {
        return Comp;
    }
}
