#include "GrabWorker.h"

Value run(const CallbackInfo& info) {
    int feedsNumber = info[0].As<Number>();
    std::string videoSourcePath = info[1].As<String>();
    Function callback = info[2].As<Function>();
    GrabWorker* asyncWorker = new GrabWorker(callback, videoSourcePath, feedsNumber);
    asyncWorker->Queue();
    std::string msg = "";
    return String::New(info.Env(),msg.c_str());
};

Object Init(Env env, Object exports) {
    exports["run"] = Function::New(env, run, std::string("run"));
    return exports;
}

NODE_API_MODULE(addon, Init)
