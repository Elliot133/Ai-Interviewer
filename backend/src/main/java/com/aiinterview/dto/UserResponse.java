package com.aiinterview.dto;

import com.aiinterview.entity.User;
import lombok.Getter;

@Getter
public class UserResponse {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phoneNumber;
    private final String careerField;

    public UserResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.careerField = user.getCareerField();
    }
}
