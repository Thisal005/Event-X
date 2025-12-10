package com.oop.EventTicketingSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventTicketingSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(EventTicketingSystemApplication.class, args);
	}
}