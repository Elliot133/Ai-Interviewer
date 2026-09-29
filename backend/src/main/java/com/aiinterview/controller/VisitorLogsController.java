package com.aiinterview.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import java.net.URL;
import java.util.Scanner;

@RestController
public class VisitorLogController {

    @GetMapping("/api/visit-log")
    public String logVisit(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        String city = "Unknown";
        String country = "Unknown";
        String isp = "Unknown";

        try {
            URL url = new URL("https://ipapi.co/" + ip + "/json/");
            Scanner sc = new Scanner(url.openStream());
            String json = sc.useDelimiter("\\A").next();
            sc.close();

            // basic parse
            if (json.contains("\"city\"")) {
                city = json.split("\"city\": \"")[1].split("\"")[0];
            }
            if (json.contains("\"country_name\"")) {
                country = json.split("\"country_name\": \"")[1].split("\"")[0];
            }
            if (json.contains("\"org\"")) {
                isp = json.split("\"org\": \"")[1].split("\"")[0];
            }
        } catch (Exception e) {
            isp = "Lookup failed - " + e.getMessage();
        }

        String log = "VISITOR => IP: " + ip + " | ISP: " + isp + " | CITY: " + city + ", " + country + " | DEVICE: " + userAgent;
        System.out.println(log); // Shows in your backend terminal like Kali

        return log;
    }
}
